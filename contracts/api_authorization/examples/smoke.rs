use ethers::{
    middleware::SignerMiddleware,
    prelude::abigen,
    providers::{Http, Middleware, Provider},
    signers::{LocalWallet, Signer},
    types::{transaction::eip2718::TypedTransaction, Address, U256},
    utils::format_units,
};
use eyre::{eyre, Result};
use std::{
    io::{BufRead, BufReader},
    str::FromStr,
    sync::Arc,
};

const PRIV_KEY_PATH: &str = "PRIV_KEY_PATH";
const RPC_URL: &str = "RPC_URL";
const STYLUS_CONTRACT_ADDRESS: &str = "STYLUS_CONTRACT_ADDRESS";

abigen!(
    ApiAuthorization,
    r#"[
        function purchase() payable returns (uint256)
        function balanceOf(address addr) view returns (uint256)
        function markUsage(address addr) returns (uint256)
        event Purchase(address indexed addr, uint256 accessings)
    ]"#
);

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    let priv_key_path = env_var(PRIV_KEY_PATH)?;
    let rpc_url = env_var(RPC_URL)?;
    let contract_address = env_var(STYLUS_CONTRACT_ADDRESS)?;

    let provider = Provider::<Http>::try_from(rpc_url)?;
    let address: Address = contract_address.parse()?;

    let priv_key = read_secret_from_file(&priv_key_path)?;
    let wallet = LocalWallet::from_str(&priv_key)?;
    let caller = wallet.address();

    let wallet_balance = provider.get_balance(caller, None).await?;
    println!(
        "Caller address: {caller:?}\nWallet balance: {} ETH",
        format_units(wallet_balance, "ether")?
    );

    let chain_id = provider.get_chainid().await?.as_u64();
    let client = Arc::new(SignerMiddleware::new(
        provider.clone(),
        wallet.with_chain_id(chain_id),
    ));

    let contract = ApiAuthorization::new(address, client.clone());

    println!("Current balance: {}", contract.balance_of(caller).call().await?);

    let price = U256::from_dec_str("2180330000000000")?; // one access unit ~0.00218033 ETH
    println!("Purchasing 1 access unit ({} wei)...", price);
    if wallet_balance < price {
        return Err(eyre!(
            "Insufficient wallet balance for purchase (need at least {})",
            format_units(price, "ether")?
        ));
    }

    let mut purchase_tx: TypedTransaction = contract.purchase().tx;
    purchase_tx.set_value(price);
    purchase_tx.set_gas(500_000u64);
    match client.call(&purchase_tx, None).await {
        Ok(_) => println!("Dry-run purchase call succeeded"),
        Err(err) => println!("Dry-run purchase reverted: {err:?}"),
    }
    let purchase_receipt = client
        .send_transaction(purchase_tx, None)
        .await?
        .confirmations(1)
        .await?
        .ok_or_else(|| eyre!("purchase transaction dropped"))?;
    println!("Purchase tx hash: {:?}", purchase_receipt.transaction_hash);

    let new_balance = contract.balance_of(caller).call().await?;
    println!("Balance after purchase: {}", new_balance);

    println!("Marking usage...");
    let mut usage_tx: TypedTransaction = contract.mark_usage(caller).tx;
    usage_tx.set_gas(350_000u64);
    let usage_receipt = client
        .send_transaction(usage_tx, None)
        .await?
        .confirmations(1)
        .await?
        .ok_or_else(|| eyre!("mark_usage transaction dropped"))?;
    println!("mark_usage tx hash: {:?}", usage_receipt.transaction_hash);

    let final_balance = contract.balance_of(caller).call().await?;
    println!("Balance after usage: {}", final_balance);

    Ok(())
}

fn env_var(name: &str) -> Result<String> {
    std::env::var(name).map_err(|_| eyre!("No {} env var set", name))
}

fn read_secret_from_file(path: &str) -> Result<String> {
    let file = std::fs::File::open(path)?;
    let mut reader = BufReader::new(file);
    let mut secret = String::new();
    reader.read_line(&mut secret)?;
    Ok(secret.trim().to_string())
}
