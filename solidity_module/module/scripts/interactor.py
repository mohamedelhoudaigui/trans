from web3 import Web3

class ContractInteractor:
    def __init__(self, contract_address, contract_abi , provider):
        self.w3 = provider

        self.contract = self.w3.eth.contract(
            address=contract_address,
            abi=contract_abi
        )
        print('interactor is ready...')

    def add_tournament(self, winner):
        tx_hash = self.contract.functions.add_tournament(winner).transact()
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

    def get_tournament(self, id):
        res = self.contract.functions.get_tournament(id).call()
        return (res)

    def get_count(self):
        return self.contract.functions.get_count().call()
