/**
 * iExec SDK Configuration and Utility Functions
 * 
 * This module provides utilities for interacting with iExec:
 * - Initialize iExec SDK
 * - Submit AI recommendation tasks
 * - Fetch task results
 * - Handle errors and retries
 */

import { IExec } from 'iexec';

// iExec configuration
const IEXEC_APP_ADDRESS = process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS!;
const IEXEC_NETWORK = process.env.NEXT_PUBLIC_IEXEC_NETWORK || 'bellecour';

export interface DonationHistoryEntry {
    nftId: string;
    nftName: string;
    amount: string;
    category?: string;
}

export interface NFTMetadata {
    tokenId: string;
    name: string;
    description?: string;
    category?: string;
    totalDonations: string;
}

export interface AIRecommendation {
    nftId: string;
    reason: string;
    confidence: number;
}

export interface RecommendationResult {
    recommendations: AIRecommendation[];
    error?: boolean;
    message?: string;
}

/**
 * Initialize iExec SDK with user's wallet
 */
export async function initIExec(provider: any): Promise<IExec> {
    try {
        const iexec = new IExec(
            {
                ethProvider: provider,
            },
            {
                chainId: IEXEC_NETWORK === 'bellecour' ? '134' : '11155111', // Bellecour or Sepolia
            }
        );

        return iexec;
    } catch (error) {
        console.error('Failed to initialize iExec:', error);
        throw new Error('Failed to initialize iExec SDK');
    }
}

/**
 * Submit an AI recommendation task to iExec
 */
export async function submitRecommendationTask(
    iexec: IExec,
    userAddress: string,
    donationHistory: DonationHistoryEntry[],
    allNFTs: NFTMetadata[]
): Promise<string> {
    try {
        if (!IEXEC_APP_ADDRESS || IEXEC_APP_ADDRESS === '0x0000000000000000000000000000000000000000') {
            throw new Error('iExec app not configured. Please deploy the worker app first.');
        }

        // Prepare input data
        const inputData = {
            userAddress,
            donationHistory,
            allNFTs,
        };

        console.log('Submitting iExec task with input:', inputData);

        // Buy task execution
        const { dealid } = await iexec.order.matchOrders({
            app: IEXEC_APP_ADDRESS,
            category: 0, // Standard computation category
            tag: ['tee', 'scone'], // Require TEE execution
            dataset: '0x0000000000000000000000000000000000000000', // No dataset
            workerpool: 'prod-v8-bellecour.main.pools.iexec.eth', // Production workerpool
            params: {
                iexec_args: JSON.stringify(inputData),
                iexec_result_storage_provider: 'ipfs',
                iexec_result_storage_proxy: 'https://result-proxy.iex.ec',
            },
        });

        console.log('Task submitted with dealid:', dealid);

        // Get task ID from deal
        const deal = await iexec.deal.show(dealid);
        const taskid = deal.tasks['0']; // First task in the deal

        return taskid;
    } catch (error: any) {
        console.error('Failed to submit iExec task:', error);
        throw new Error(`Failed to submit task: ${error.message}`);
    }
}

/**
 * Wait for task completion and fetch result
 * Polls task status every 10 seconds
 */
export async function waitForTaskResult(
    iexec: IExec,
    taskid: string,
    maxWaitTime: number = 300000 // 5 minutes default
): Promise<RecommendationResult> {
    const startTime = Date.now();
    const pollInterval = 10000; // 10 seconds

    while (Date.now() - startTime < maxWaitTime) {
        try {
            const task = await iexec.task.show(taskid);
            console.log('Task status:', task.status);

            if (task.status === 'COMPLETED') {
                // Fetch the result
                const result = await iexec.task.fetchResults(taskid);
                const resultText = await result.text();
                const resultJson: RecommendationResult = JSON.parse(resultText);

                console.log('Task completed successfully:', resultJson);
                return resultJson;
            } else if (task.status === 'FAILED' || task.status === 'TIMEOUT') {
                throw new Error(`Task ${task.status.toLowerCase()}: ${task.statusMessage || 'Unknown error'}`);
            }

            // Wait before next poll
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } catch (error: any) {
            if (error.message.includes('Task failed') || error.message.includes('Task timeout')) {
                throw error;
            }
            console.error('Error polling task status:', error);
            // Continue polling on transient errors
        }
    }

    throw new Error('Task timeout: exceeded maximum wait time');
}

/**
 * Get AI recommendations (convenience function)
 * Combines submit and wait operations
 */
export async function getAIRecommendations(
    provider: any,
    userAddress: string,
    donationHistory: DonationHistoryEntry[],
    allNFTs: NFTMetadata[]
): Promise<RecommendationResult> {
    try {
        // Initialize iExec
        const iexec = await initIExec(provider);

        // Submit task
        const taskid = await submitRecommendationTask(
            iexec,
            userAddress,
            donationHistory,
            allNFTs
        );

        console.log('Task submitted:', taskid);

        // Wait for result
        const result = await waitForTaskResult(iexec, taskid);

        return result;
    } catch (error: any) {
        console.error('Failed to get AI recommendations:', error);
        throw error;
    }
}

/**
 * Estimate task cost in RLC
 */
export async function estimateTaskCost(iexec: IExec): Promise<string> {
    try {
        const appOrder = await iexec.order.fetchAppOrderbook(IEXEC_APP_ADDRESS);
        const cheapestOrder = appOrder.orders[0];

        if (!cheapestOrder) {
            return 'Unknown';
        }

        // Convert from nRLC to RLC
        const costInRLC = Number(cheapestOrder.order.appprice) / 1e9;
        return costInRLC.toFixed(4);
    } catch (error) {
        console.error('Failed to estimate cost:', error);
        return 'Unknown';
    }
}
