import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarkStore {
  bookmarkedRestaurants: Set<string>;
  isBookmarked: (restaurantId: string) => boolean;
  toggleBookmark: (restaurantId: string) => void;
  addBookmark: (restaurantId: string) => void;
  removeBookmark: (restaurantId: string) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarkedRestaurants: new Set<string>(),

      isBookmarked: (restaurantId: string) => {
        return get().bookmarkedRestaurants.has(restaurantId);
      },

      toggleBookmark: (restaurantId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarkedRestaurants);
          if (newBookmarks.has(restaurantId)) {
            newBookmarks.delete(restaurantId);
          } else {
            newBookmarks.add(restaurantId);
          }
          return { bookmarkedRestaurants: newBookmarks };
        });
      },

      addBookmark: (restaurantId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarkedRestaurants);
          newBookmarks.add(restaurantId);
          return { bookmarkedRestaurants: newBookmarks };
        });
      },

      removeBookmark: (restaurantId: string) => {
        set((state) => {
          const newBookmarks = new Set(state.bookmarkedRestaurants);
          newBookmarks.delete(restaurantId);
          return { bookmarkedRestaurants: newBookmarks };
        });
      },
    }),
    {
      name: 'beli-bookmarks',
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              bookmarkedRestaurants: new Set(state.bookmarkedRestaurants),
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              bookmarkedRestaurants: Array.from(value.state.bookmarkedRestaurants),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
