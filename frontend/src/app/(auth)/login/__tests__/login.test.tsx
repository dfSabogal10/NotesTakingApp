import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;
const mockApiPost = api.post as jest.MockedFunction<typeof api.post>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockRejectedValue(new Error("Unauthorized"));
  });

  it("shows validation error and does not call api.post when password is empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await screen.findByPlaceholderText("Email address");

    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it("shows validation error and does not call api.post when email is empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await screen.findByPlaceholderText("Email address");

    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(mockApiPost).not.toHaveBeenCalled();
  });
});
