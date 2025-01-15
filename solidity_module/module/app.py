from scripts.init import init
from tests.contract_test import main_test


interactor = init()
print("testing...")
main_test(interactor)
