import { describe, it, expect } from "vitest";
import { passwordStrength, passwordChecks } from "../index";

describe("passwordStrength", () => {
  it("should return empty level for empty string", () => {
    const result = passwordStrength("");
    expect(result.level).toBe("empty");
    expect(result.score).toBe(0);
    expect(result.percent).toBe(0);
    expect(result.checks).toHaveLength(5);
  });

  it("should evaluate weak passwords correctly", () => {
    const result = passwordStrength("abc");
    expect(result.level).toBe("weak");
    expect(result.score).toBe(0);
    expect(result.percent).toBe(20);

    const result2 = passwordStrength("abc1");
    expect(result2.level).toBe("weak");
    expect(result2.score).toBe(1);
    expect(result2.percent).toBe(40);
  });

  it("should evaluate fair passwords correctly", () => {
    const result = passwordStrength("Abc1");
    expect(result.score).toBe(2);
    expect(result.level).toBe("fair");
    expect(result.percent).toBe(60);
  });

  it("should evaluate good passwords correctly", () => {
    // 4 checks passed => score=3, level=good
    // upper, lower, number, length=8
    const result = passwordStrength("Abcd1234");
    expect(result.score).toBe(3);
    expect(result.level).toBe("good");
    expect(result.percent).toBe(80);
  });

  it("should evaluate strong passwords correctly", () => {
    // 5 checks passed => score=4, level=strong
    const result = passwordStrength("Abcd1234@");
    expect(result.score).toBe(4);
    expect(result.level).toBe("strong");
    expect(result.percent).toBe(100);
  });

  it("should penalize obvious sequences", () => {
    const result = passwordStrength("12345Abcd!");
    expect(result.score).toBe(2);
    expect(result.level).toBe("fair");

    const result2 = passwordStrength("Password123!");
    expect(result2.level).toBe("fair");
    expect(result2.score).toBe(2);

    const result3 = passwordStrength("wealthspan1!A");
    expect(result3.level).toBe("fair");
    expect(result3.score).toBe(2);

    const result4 = passwordStrength("aaaaaaaa");
    expect(result4.score).toBe(0);
    expect(result4.level).toBe("weak");
  });

  it("should bonus long passphrases", () => {
    const result = passwordStrength("thisisareallylongpassphrase!");
    expect(result.score).toBe(3);
    expect(result.level).toBe("good");

    const result2 = passwordStrength("Thisisareallylongpassphrase!");
    expect(result2.score).toBe(4);
    expect(result2.level).toBe("strong");
  });

  it("should clamp scores correctly", () => {
    const result = passwordStrength("12345");
    expect(result.score).toBe(0);
    expect(result.level).toBe("weak");

    const result2 = passwordStrength("ThisIsALongPassphraseWithNumbers123!");
    expect(result2.score).toBe(4);
    expect(result2.level).toBe("strong");
  });
});
