import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NoteEditorPage from "../page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiGet = api.get as jest.MockedFunction<typeof api.get>;
const mockApiPatch = api.patch as jest.MockedFunction<typeof api.patch>;

const mockNote = {
  id: 1,
  title: "Test Note",
  content: "",
  category: { id: 1, name: "Random Thoughts", color_hex: "#F3C6A3" },
  updated_at: "2024-07-21T12:00:00Z",
};

const mockCategories = [
  { id: 1, name: "Random Thoughts", color_hex: "#F3C6A3" },
];

describe("NoteEditorPage autosave", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockApiGet.mockImplementation((path: string) => {
      if (path.includes("/api/notes/1/")) return Promise.resolve(mockNote);
      if (path.includes("/api/categories/")) return Promise.resolve(mockCategories);
      return Promise.reject(new Error("Unknown path"));
    });
    mockApiPatch.mockResolvedValue({
      ...mockNote,
      content: "final content",
      updated_at: "2024-07-21T12:01:00Z",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("triggers PATCH only once after debounce when typing multiple times", async () => {
    render(<NoteEditorPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Note Title")).toBeInTheDocument();
    });

    const contentInput = screen.getByPlaceholderText("Pour your heart out...");

    fireEvent.change(contentInput, { target: { value: "a" } });
    fireEvent.change(contentInput, { target: { value: "ab" } });
    fireEvent.change(contentInput, { target: { value: "abc" } });

    expect(mockApiPatch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(600);

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledTimes(1);
      expect(mockApiPatch).toHaveBeenCalledWith("/api/notes/1/", {
        content: "abc",
      });
    });
  });
});
