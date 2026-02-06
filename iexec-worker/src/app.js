#!/usr/bin/env node

/**
 * iExec Worker for AI Donation Recommendations
 * 
 * This worker receives user donation data, analyzes it using GPT,
 * and returns personalized NFT donation recommendations.
 * 
 * Flow:
 * 1. Read input from iExec (stdin or /iexec_in/iexec_in.txt)
 * 2. Fetch GPT API key from iExec secrets
 * 3. Analyze donation history and NFT metadata
 * 4. Call GPT API for recommendations
 * 5. Write results to /iexec_out/computed.json
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// iExec standard paths
const IEXEC_IN = process.env.IEXEC_IN || '/iexec_in';
const IEXEC_OUT = process.env.IEXEC_OUT || '/iexec_out';
const INPUT_FILE = path.join(IEXEC_IN, 'iexec_in.txt');
const OUTPUT_FILE = path.join(IEXEC_OUT, 'computed.json');

/**
 * Read input data from iExec
 */
function readInput() {
    try {
        // Try reading from iExec input file first
        if (fs.existsSync(INPUT_FILE)) {
            const data = fs.readFileSync(INPUT_FILE, 'utf8');
            return JSON.parse(data);
        }

        // Fallback to stdin for local testing
        console.error('Reading from stdin for local testing...');
        const buffer = fs.readFileSync(0, 'utf8'); // Read from stdin
        return JSON.parse(buffer);
    } catch (error) {
        throw new Error(`Failed to read input: ${error.message}`);
    }
}

/**
 * Get GPT API key from iExec secrets
 */
function getApiKey() {
    // In iExec, secrets are injected as environment variables
    const apiKey = process.env.IEXEC_SCRT_OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not found in iExec secrets');
    }

    return apiKey;
}

/**
 * Build GPT prompt for donation recommendations
 */
function buildPrompt(userAddress, donationHistory, allNFTs) {
    const hasHistory = donationHistory && donationHistory.length > 0;

    let prompt = `You are an AI assistant helping users discover meaningful NFT donation opportunities.

User Wallet: ${userAddress}

`;

    if (hasHistory) {
        prompt += `This user has previously donated to the following NFTs:\n`;
        donationHistory.forEach(d => {
            prompt += `- "${d.nftName}" (ID: ${d.nftId}): ${d.amount} ETH - Category: ${d.category || 'General'}\n`;
        });
        prompt += '\n';
    } else {
        prompt += `This is a new user with no donation history.\n\n`;
    }

    prompt += `Available NFTs for donation:\n`;
    allNFTs.forEach(nft => {
        prompt += `- ID: ${nft.tokenId}, Name: "${nft.name}", Category: ${nft.category || 'General'}, Description: ${nft.description || 'No description'}, Total Received: ${nft.totalDonations} ETH\n`;
    });

    prompt += `\nBased on ${hasHistory ? 'the user\'s donation history and interests' : 'the available opportunities'}, recommend the top 3 NFTs they should consider donating to.

For each recommendation:
1. Explain WHY this NFT is a good match
2. Provide a confidence score (0-100)
3. Consider donation patterns, categories, impact potential, and social good

Response format (valid JSON only):
{
  "recommendations": [
    {
      "nftId": "string",
      "reason": "string (2-3 sentences max)",
      "confidence": number
    }
  ]
}`;

    return prompt;
}

/**
 * Call GPT API for recommendations
 */
async function getRecommendations(apiKey, userAddress, donationHistory, allNFTs) {
    const openai = new OpenAI({ apiKey });

    const prompt = buildPrompt(userAddress, donationHistory, allNFTs);

    console.error('Calling GPT API...');

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Cost-efficient model
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert AI assistant specializing in personalized NFT donation recommendations. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 800,
            response_format: { type: "json_object" } // Enforce JSON output
        });

        const content = response.choices[0].message.content;
        console.error('GPT response received');

        // Parse and validate the JSON response
        const result = JSON.parse(content);

        if (!result.recommendations || !Array.isArray(result.recommendations)) {
            throw new Error('Invalid response format from GPT');
        }

        // Validate each recommendation
        result.recommendations = result.recommendations.slice(0, 3).map(rec => {
            if (!rec.nftId || !rec.reason || typeof rec.confidence !== 'number') {
                throw new Error('Invalid recommendation structure');
            }

            // Ensure confidence is between 0-100
            rec.confidence = Math.max(0, Math.min(100, rec.confidence));

            return {
                nftId: String(rec.nftId),
                reason: rec.reason,
                confidence: rec.confidence
            };
        });

        return result;
    } catch (error) {
        console.error('GPT API error:', error.message);
        throw error;
    }
}

/**
 * Write output to iExec result file
 */
function writeOutput(data) {
    try {
        // Ensure output directory exists
        if (!fs.existsSync(IEXEC_OUT)) {
            fs.mkdirSync(IEXEC_OUT, { recursive: true });
        }

        // Write the result
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.error(`Output written to ${OUTPUT_FILE}`);

        // Also write to stdout for local testing
        console.log(JSON.stringify(data));
    } catch (error) {
        throw new Error(`Failed to write output: ${error.message}`);
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.error('=== iExec AI Donation Recommender Worker ===');
        console.error('Starting execution...');

        // Step 1: Read input
        console.error('Step 1: Reading input data...');
        const input = readInput();

        const { userAddress, donationHistory = [], allNFTs = [] } = input;

        if (!userAddress) {
            throw new Error('userAddress is required in input');
        }

        if (!allNFTs || allNFTs.length === 0) {
            throw new Error('allNFTs array is required and must not be empty');
        }

        console.error(`User: ${userAddress}`);
        console.error(`Donation history entries: ${donationHistory.length}`);
        console.error(`Available NFTs: ${allNFTs.length}`);

        // Step 2: Get API key from secrets
        console.error('Step 2: Retrieving GPT API key from secrets...');
        const apiKey = getApiKey();
        console.error('API key retrieved successfully');

        // Step 3: Get AI recommendations
        console.error('Step 3: Generating AI recommendations...');
        const recommendations = await getRecommendations(
            apiKey,
            userAddress,
            donationHistory,
            allNFTs
        );

        console.error(`Generated ${recommendations.recommendations.length} recommendations`);

        // Step 4: Write output
        console.error('Step 4: Writing output...');
        writeOutput(recommendations);

        console.error('=== Execution completed successfully ===');
        process.exit(0);
    } catch (error) {
        console.error('=== Execution failed ===');
        console.error('Error:', error.message);

        // Write error result
        const errorOutput = {
            error: true,
            message: error.message,
            recommendations: []
        };

        try {
            writeOutput(errorOutput);
        } catch (writeError) {
            console.error('Failed to write error output:', writeError.message);
        }

        process.exit(1);
    }
}

// Run the worker
main();
