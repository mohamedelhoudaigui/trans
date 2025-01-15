from scripts.init import init
from scripts.testing import testing
from tests.contract_test import main_test

import pytest
import time


interactor = init()
print("testing...")
main_test(interactor)
