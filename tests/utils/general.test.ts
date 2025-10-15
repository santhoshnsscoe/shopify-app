import { getLocalStorage, setLocalStorage, removeLocalStorage } from "../../app/utils/general";

describe("utils/general", () => {
  const skey: string = "testing-key";
  const svalue: string = "test-value";

  describe("local storage", () => {
    it("set local storage", () => {
      setLocalStorage(skey, svalue);
      const value = getLocalStorage(skey);
      expect(value).toBe(svalue);
    });

    it("get local storage", () => {
      const value = getLocalStorage(skey);
      expect(value).toBe(svalue);
    });

    it("remove local storage", () => {
      removeLocalStorage(skey);
      const value = getLocalStorage(skey);
      expect(value).toBeNull();
    });

    it("no local storage", () => {
      const value = getLocalStorage(skey);
      expect(value).toBeNull();
    });
  });
});