/**
 * React Hook for AI Donation Recommendations via iExec
 * 
 * This hook manages the state and lifecycle of fetching AI recommendations
 * through iExec's off-chain computation platform.
 */

import { useState, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import {
    getAIRecommendations,
    type DonationHistoryEntry,
    type NFTMetadata,
    type AIRecommendation,
} from '@/lib/iexec';

export interface UseAIRecommendationOptions {
    onSuccess?: (recommendations: AIRecommendation[]) => void;
    onError?: (error: Error) => void;
}

export interface UseAIRecommendationReturn {
    recommendations: AIRecommendation[];
    isLoading: boolean;
    error: Error | null;
    fetchRecommendations: (
        userAddress: string,
        donationHistory: DonationHistoryEntry[],
        allNFTs: NFTMetadata[]
    ) => Promise<void>;
    reset: () => void;
}

export function useAIRecommendation(
    options: UseAIRecommendationOptions = {}
): UseAIRecommendationReturn {
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { data: walletClient } = useWalletClient();

    const fetchRecommendations = useCallback(
        async (
            userAddress: string,
            donationHistory: DonationHistoryEntry[],
            allNFTs: NFTMetadata[]
        ) => {
            try {
                setIsLoading(true);
                setError(null);
                setRecommendations([]);

                if (!walletClient) {
                    throw new Error('Please connect your wallet first');
                }

                if (!allNFTs || allNFTs.length === 0) {
                    throw new Error('No NFTs available for recommendations');
                }

                console.log('Fetching AI recommendations...');
                console.log('User:', userAddress);
                console.log('History entries:', donationHistory.length);
                console.log('Available NFTs:', allNFTs.length);

                // Call iExec to get recommendations
                const result = await getAIRecommendations(
                    walletClient,
                    userAddress,
                    donationHistory,
                    allNFTs
                );

                if (result.error) {
                    throw new Error(result.message || 'Failed to generate recommendations');
                }

                setRecommendations(result.recommendations);
                options.onSuccess?.(result.recommendations);
            } catch (err: any) {
                const error = err instanceof Error ? err : new Error('Unknown error occurred');
                setError(error);
                options.onError?.(error);
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [walletClient, options]
    );

    const reset = useCallback(() => {
        setRecommendations([]);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        recommendations,
        isLoading,
        error,
        fetchRecommendations,
        reset,
    };
}
