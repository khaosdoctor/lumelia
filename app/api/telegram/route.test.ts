import { headers } from "next/headers";
import { POST } from "./route";
import { scheduleMessage } from "./schedule-message";

jest.mock("next/headers");
jest.mock("./schedule-message");

const payload = {
  json: async () => ({
    message: {
      message_id: 123,
      chat: { id: 123 },
      entities: [{ length: 10, offset: 0, type: "bot_command" }],
      text: `/splitloot Session data: From 2023-05-30, 19:45:04 to 2023-05-30, 20:52:15
      Session: 01:07h
      Loot Type: Leader
      Loot: 952,548
      Supplies: 397,771
      Balance: 554,777
      Knight Orion
          Loot: 946,698
          Supplies: 102,412
          Balance: 844,286
          Damage: 1,404,336
          Healing: 189,838
      Mistee Shadowforge
          Loot: 200
          Supplies: 80,570
          Balance: -80,370
          Damage: 1,126,931
          Healing: 136,154
      Raagendazss (Leader)
          Loot: 5,650
          Supplies: 214,789
          Balance: -209,139
          Damage: 1,916,587
          Healing: 945,679
      `,
    },
  }),
} as Request;

describe("POST /api/telegram", () => {
  it("should return 401 if the secret token is invalid", async () => {
    (headers as jest.Mock).mockReturnValue(new Headers());

    const response = await POST(payload);

    expect(response.status).toEqual(401);
  });

  it("should schedule a message", async () => {
    (headers as jest.Mock).mockReturnValue(
      new Headers({
        "x-telegram-bot-api-secret-token":
          "-l6Lf4QuzfMR6ZNww30Zi9C0TAm-0XDGMBSoniYDBfQ",
      })
    );

    const response = await POST(payload);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ success: true });

    expect(scheduleMessage).toHaveBeenCalledWith({
      chatId: 123,
      text: `*Knight Orion*
\\- transfer 265295 to Mistee Shadowforge
\\- transfer 394064 to Raagendazss`,
      replyToMessageId: 123,
    });
  });
});