from web3 import Web3

def deploy_contract(abi, bytecode, provider):
    try:
        provider.eth.default_account = provider.eth.accounts[0]
        Contract = provider.eth.contract(abi=abi, bytecode=bytecode)
        tx_hash = Contract.constructor().transact()
        # Wait for transaction receipt
        tx_receipt = provider.eth.wait_for_transaction_receipt(tx_hash)
        print(f'----------deployed successfully at : {tx_receipt.contractAddress}----------')
        return tx_receipt.contractAddress
    
    except Exception as e:
        print(f"Deployment error: {e}")
