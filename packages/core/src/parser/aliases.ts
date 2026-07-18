// Alias table: forgiving synonyms → canonical component names.
// Keeps the DSL tolerant of the many ways an LLM (or human) might name things.

export const ALIASES: Record<string, string> = {
  // text
  h: "heading",
  title: "heading",
  label: "text",
  p: "text",
  paragraph: "text",
  a: "link",
  hyperlink: "link",

  // inputs
  btn: "button",
  textfield: "input",
  field: "input",
  textbox: "input",
  textarea: "textarea",
  multiline: "textarea",
  check: "checkbox",
  cb: "checkbox",
  option: "radio",
  dropdown: "select",
  combo: "select",
  menu: "select",
  switch: "toggle",
  range: "slider",
  searchbox: "search",

  // layout / chrome
  hbox: "row",
  vbox: "col",
  column: "col",
  hr: "divider",
  separator: "divider",
  gap_: "spacer",

  panel: "card",
  box: "card",
  header: "navbar",
  topbar: "navbar",
  tabbar: "tabs",
  side: "sidebar",
  nav: "sidebar",
  dialog: "modal",
  popup: "modal",

  // data / media
  img: "image",
  picture: "image",
  photo: "image",
  profile: "avatar",
  ul: "list",
  ol: "list",
  grid: "table",
  treeview: "tree",
  filetree: "tree",
  tree_: "tree",
  bar: "progress",
  graph: "chart",

  // frames
  window: "screen",
  page: "screen",
  frame: "screen",
  phone: "screen",
};

export function resolveAlias(name: string): string {
  const lower = name.toLowerCase();
  return ALIASES[lower] ?? lower;
}
