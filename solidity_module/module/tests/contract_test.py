def asserter(attr, result, answer):
    assert result == answer, f"{attr}: {result} should be: {answer}"

def test_count(interactor):
    try:
        value = interactor.get_count()
        asserter("tournament count", value, 0)
        interactor.add_tournament("test1")
        interactor.add_tournament("test2")
        interactor.add_tournament("test3")
        interactor.add_tournament("test4")
        value = interactor.get_count()
        asserter("tournament count", value, 4)
        print("all test passed on tournament count")
    except Exception as e:
        print(f"{e}")
        exit(1);


def main_test(interactor):
    test_count(interactor)
