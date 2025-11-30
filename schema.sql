-- Create airdrops table
CREATE TABLE IF NOT EXISTS airdrops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  potential VARCHAR(50) NOT NULL,
  tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_airdrops_created_at ON airdrops(created_at DESC);

-- Insert sample data from AIRDROPS constant
INSERT INTO airdrops (id, name, description, category, difficulty, potential, tasks) VALUES
('layerzero', 'LayerZero', 'Cross-chain messaging protocol with confirmed airdrop', 'DeFi', 'Medium', 'High', '[{"id":"1","title":"Bridge assets","description":"Use Stargate Finance to bridge assets","completed":false},{"id":"2","title":"Use dApps","description":"Interact with LayerZero-powered applications","completed":false}]'::jsonb),
('zksync', 'zkSync Era', 'Ethereum Layer 2 scaling solution using zero-knowledge proofs', 'Layer 2', 'Easy', 'High', '[{"id":"1","title":"Bridge ETH","description":"Bridge ETH to zkSync Era","completed":false},{"id":"2","title":"Swap tokens","description":"Make swaps on zkSync DEXes","completed":false}]'::jsonb),
('starknet', 'StarkNet', 'Layer 2 scaling solution using STARK proofs', 'Layer 2', 'Medium', 'High', '[{"id":"1","title":"Deploy wallet","description":"Deploy ArgentX or Braavos wallet","completed":false},{"id":"2","title":"Bridge assets","description":"Bridge ETH to StarkNet","completed":false}]'::jsonb),
('scroll', 'Scroll', 'zkEVM Layer 2 solution for Ethereum', 'Layer 2', 'Easy', 'Medium', '[{"id":"1","title":"Bridge to Scroll","description":"Bridge assets to Scroll network","completed":false},{"id":"2","title":"Use dApps","description":"Interact with Scroll ecosystem dApps","completed":false}]'::jsonb),
('zora', 'Zora', 'NFT marketplace and Layer 2 network', 'NFT', 'Easy', 'Medium', '[{"id":"1","title":"Mint NFT","description":"Mint an NFT on Zora","completed":false},{"id":"2","title":"Bridge to Zora","description":"Bridge ETH to Zora network","completed":false}]'::jsonb),
('polyhedra', 'Polyhedra', 'Zero-knowledge proof infrastructure', 'DeFi', 'Hard', 'High', '[{"id":"1","title":"Use zkBridge","description":"Bridge assets using Polyhedra zkBridge","completed":false},{"id":"2","title":"Testnet tasks","description":"Complete testnet activities","completed":false}]'::jsonb);
