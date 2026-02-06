"use client";

/**
 * AI Recommendations Component
 * 
 * Displays AI-powered NFT donation recommendations powered by iExec
 * - Triggers off-chain GPT computation via iExec
 * - Shows loading state during computation
 * - Displays recommendations with confidence scores
 */

import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Sparkles, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { useAIRecommendation } from '@/hooks/useAIRecommendation';
import { Button } from '@/components/ui/button';
import type { NftData } from '@/app/page';
import Image from 'next/image';

interface AIRecommendationsProps {
  nfts: NftData[];
}

export default function AIRecommendations({ nfts }: AIRecommendationsProps) {
  const { address, isConnected } = useAccount();
  const { recommendations, isLoading, error, fetchRecommendations } = useAIRecommendation({
    onSuccess: (recs) => {
      console.log('Recommendations received:', recs);
    },
    onError: (err) => {
      console.error('Recommendation error:', err);
    },
  });

  // Prepare NFT metadata for iExec
  const allNFTs = useMemo(
    () =>
      nfts.map((nft) => ({
        tokenId: String(nft.tokenId),
        name: nft.metadata?.name || `NFT #${nft.tokenId}`,
        description: nft.metadata?.description || '',
        category: nft.metadata?.category || 'General',
        totalDonations: formatEther(nft.totalDonations),
      })),
    [nfts]
  );

  // For now, we'll use empty donation history
  // In future, you can fetch this from on-chain events or backend
  const donationHistory = useMemo(() => [], []);

  const handleGetRecommendations = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (nfts.length === 0) {
      alert('No NFTs available yet');
      return;
    }

    await fetchRecommendations(address, donationHistory, allNFTs);
  };

  // Find recommended NFTs from the list
  const recommendedNFTs = useMemo(() => {
    return recommendations
      .map((rec) => {
        const nft = nfts.find((n) => String(n.tokenId) === rec.nftId);
        return nft ? { ...nft, recommendation: rec } : null;
      })
      .filter(Boolean);
  }, [recommendations, nfts]);

  return (
    <section className="rounded-2xl border bg-card dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-indigo-900/40 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-semibold">AI Recommendations</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Get personalized NFT donation suggestions powered by GPT via iExec
          </p>
        </div>
      </div>

      {!isConnected && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/60 rounded-lg p-4">
          <AlertCircle className="h-4 w-4" />
          <span>Connect your wallet to get AI recommendations</span>
        </div>
      )}

      {isConnected && recommendations.length === 0 && !isLoading && !error && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Discover NFTs that align with your interests using AI analysis
          </p>
          <Button
            onClick={handleGetRecommendations}
            disabled={!isConnected || nfts.length === 0}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Get AI Recommendations
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-sm font-medium mb-2">Analyzing via iExec...</p>
          <p className="text-xs text-muted-foreground">
            GPT is running securely off-chain. This may take 30-90 seconds.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to get recommendations</p>
              <p className="text-xs text-destructive/80 mt-1">{error.message}</p>
              <Button
                onClick={handleGetRecommendations}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Here are {recommendations.length} personalized recommendations
            </p>
            <Button onClick={handleGetRecommendations} variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-3 w-3" />
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {recommendedNFTs.map((item: any, index) => (
              <div
                key={item.tokenId}
                className="flex gap-4 rounded-lg bg-background/60 p-4 border border-indigo-500/20"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border">
                  <Image
                    src={item.metadata.image}
                    alt={item.metadata.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.metadata.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatEther(item.totalDonations)} ETH donated
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md flex-shrink-0">
                      <TrendingUp className="h-3 w-3 text-indigo-500" />
                      <span className="text-xs font-semibold text-indigo-500">
                        {item.recommendation.confidence}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.recommendation.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground bg-background/40 rounded-lg p-3 mt-4">
            <p>
              🔒 These recommendations were generated using GPT running securely on iExec's
              decentralized infrastructure. Your API key was never exposed to the frontend.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
