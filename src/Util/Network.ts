import { getCacheStorage, getStorage } from "../storage";
import { getDeviceId } from "./Formatting";
import { isElectron } from "./Helpers";
import { getUserViews } from "../Client/index";
import type { BaseItemDto, CollectionType } from "../Client/index";

const storage = getStorage();
const cacheStorage = getCacheStorage();

export async function getLibrary(type: CollectionType) {
  if (cacheStorage.get(`library-${type}`)) {
    return cacheStorage.get(`library-${type}`) as BaseItemDto;
  }

  const user = storage.get("User");

  if (!user || !user.Id) {
    throw new Error("Missing or invalid user");
  }

  const libraries = await getUserViews({
    query: {
      userId: storage.get("User").Id
    }
  });

  const library = libraries.data?.Items?.filter((library) => library.CollectionType && library.CollectionType == type)[0];

  if (!library) {
    throw new Error("Library not found");
  }

  cacheStorage.set(`library-${type}`, library);

  return library;
}
