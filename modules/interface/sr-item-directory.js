// Custom Item Directory (v13 AppV2)
export class SR5ItemDirectory extends foundry.applications.sidebar.tabs.ItemDirectory {

  /**
   * @override — Owned items keep the id of the world item they were dropped from (keepId),
   * so core would treat an item dragged out of an actor sheet as "already there" and only
   * re-sort it. Always import embedded items as a new world item.
   */
  _entryAlreadyExists(entry) {
    if (entry.parent) return false
    return super._entryAlreadyExists(entry)
  }
}
