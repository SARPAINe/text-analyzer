import { connectToDatabase, sequelize } from "../database";

describe("Database connection", () => {
  it("should connect successfully to the database", async () => {
    const authenticateSpy = jest.spyOn(sequelize, "authenticate");
    const syncSpy = jest.spyOn(sequelize, "sync");

    await connectToDatabase();

    expect(authenticateSpy).toHaveBeenCalled();
    expect(syncSpy).toHaveBeenCalled();
  });

  it("should log error if database connection fails", async () => {
    const error = new Error("Failed to connect");

    const authenticateSpy = jest
      .spyOn(sequelize, "authenticate")
      .mockRejectedValueOnce(error);
    const syncSpy = jest.spyOn(sequelize, "sync");

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await connectToDatabase();

    expect(syncSpy).toHaveBeenCalled();
    expect(authenticateSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unable to connect to the database:",
      error
    );

    consoleErrorSpy.mockRestore();
  });
  it("should log error if database sync fails", async () => {
    const error = new Error("Sync failed");

    const syncSpy = jest.spyOn(sequelize, "sync").mockRejectedValueOnce(error); // simulate sync failure
    const authenticateSpy = jest.spyOn(sequelize, "authenticate");

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await connectToDatabase();

    expect(syncSpy).toHaveBeenCalled();
    expect(authenticateSpy).not.toHaveBeenCalled(); // authenticate should not be called if sync fails
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unable to connect to the database:",
      error
    );

    consoleErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
