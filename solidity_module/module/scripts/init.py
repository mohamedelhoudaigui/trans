import os
from web3 import Web3
from solcx import install_solc
from dotenv import load_dotenv

from scripts.interactor import ContractInteractor
from scripts.compile import compile_solidity, get_contract_data
from scripts.deploy import deploy_contract


load_dotenv()
 
SOLIDITY_VERSION = os.getenv('SOLIDITY_VERSION') 
SOL_PATH = os.getenv('SOL_PATH')
CONTRACT_NAME = os.getenv('CONTRACT_NAME')
RPC_URL = os.getenv('RPC_URL')

def compile_and_deploy(provider):
    install_solc(SOLIDITY_VERSION)
    compiled = compile_solidity(SOL_PATH, SOLIDITY_VERSION)
    abi, bytecode = get_contract_data(compiled, CONTRACT_NAME)
    address = deploy_contract(abi, bytecode, provider)
    interactor = ContractInteractor(address, abi, provider)
    return interactor


def init():
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    print(f"Connected: {w3.is_connected()}")
    interactor = compile_and_deploy(w3)
    return interactor
