// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTDonation is ERC721URIStorage, ReentrancyGuard {
    // Replaces the old "Counters" library (removed in OpenZeppelin v5)
    uint256 private _tokenIds;

    /// Tracks total ETH donated per tokenId.
    mapping(uint256 => uint256) public totalDonations;

    /// Emitted when a donation is made to a token.
    event DonationReceived(
        address indexed donor,
        uint256 indexed tokenId,
        uint256 amount
    );

    constructor() ERC721("NFT Donation", "DONATE") {}

    /// Mint a new NFT with metadata hosted off-chain (e.g., IPFS).
    function mintNFT(string memory tokenURI)
        external
        returns (uint256 newTokenId)
    {
        _tokenIds++;
        newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }

    /// Donate ETH directly to the owner of a given tokenId.
    function donate(uint256 tokenId) external payable nonReentrant {
        // We use ownerOf() instead of _ownerOf() because ownerOf() 
        // automatically REVERTS if the token does not exist.
        address tokenOwner = ownerOf(tokenId);

        require(msg.value > 0, "Donation must be greater than zero");

        // Send ETH to the owner of the NFT
        (bool sent, ) = payable(tokenOwner).call{value: msg.value}("");
        require(sent, "Donation transfer failed");

        // Track donation stats
        totalDonations[tokenId] += msg.value;

        emit DonationReceived(msg.sender, tokenId, msg.value);
    }

    /// Returns the total number of NFTs minted so far.
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}