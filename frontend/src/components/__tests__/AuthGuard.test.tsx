import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "../AuthGuard";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;

describe("AuthGuard", () => {
  const mockReplace = jest.fn();
  const children = <div data-testid="children">Protected content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("redirects to /login on 401", async () => {
    mockApiGet.mockRejectedValue(new Error("401"));
    render(<AuthGuard>{children}</AuthGuard>);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    expect(screen.queryByTestId("children")).not.toBeInTheDocument();
  });

  it("renders children on success", async () => {
    mockApiGet.mockResolvedValue([]);
    render(<AuthGuard>{children}</AuthGuard>);

    await waitFor(() => {
      expect(screen.getByTestId("children")).toBeInTheDocument();
    });

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
