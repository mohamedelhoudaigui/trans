from solcx import compile_standard
import json, os

def compile_solidity(source_dir, sol_version):
    try:
        sources = {} 
        for filename in os.listdir(source_dir):
            if filename.endswith('.sol'):
                filepath = os.path.join(source_dir, filename)
                with open(filepath, 'r') as file:
                    sources[filename] = {
                        "content": file.read()
                    }
        
        compiled_sol = compile_standard(
            {
                "language": "Solidity",
                "sources": sources,
                "settings": {
                    "outputSelection": {
                        "*": {
                            "*": ["abi", "evm.bytecode"]
                        }
                    }
                }
            },
            solc_version=sol_version
        )
    
        print("-----------compiled successfully-----------------")
        return compiled_sol

    except Exception as e:
        print(f"Compilation error: {e}")

# Get contract binary and ABI
def get_contract_data(compiled_sol, contract_name):
    for source_file in compiled_sol["contracts"]:
        if contract_name in compiled_sol["contracts"][source_file]:
            contract_interface = compiled_sol["contracts"][source_file][contract_name]
            
            bytecode = contract_interface["evm"]["bytecode"]["object"]
            abi = contract_interface["abi"]
            print("-----------abi and bytecode getted successfully-----------------")
            return abi, bytecode
    return None, None
