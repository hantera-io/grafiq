// Preset examples shown in the playground dropdown. Also serve as living docs.

export interface Example {
  name: string;
  source: string;
}

export const EXAMPLES: Example[] = [
  {
    name: "Login screen",
    source: `screen "Login" size=380x520
  navbar "MyApp"
    avatar
  col pad=24 gap=16
    heading "Welcome back"
    text "Sign in to continue" muted
    input "Email" placeholder="you@example.com"
    input "Password" type=password
    row gap=8
      checkbox "Remember me" checked
      spacer
      link "Forgot password?"
    button "Sign In" primary fill
    divider "or"
    button "Continue with Google"`,
  },
  {
    name: "Dashboard",
    source: `screen "Dashboard" size=900x560
  navbar "Analytics"
    tabs "Overview | Reports | Settings" active=0
    avatar
  row gap=16 fill
    sidebar w=170
      list "Home, Traffic, Sales, Users" active=1
    col gap=16 fill
      row gap=16
        card "Visitors" { heading "12.4k"; text "+8% this week" muted }
        card "Revenue" { heading "$3.2k"; text "+2% this week" muted }
        card "Signups" { heading "312"; text "-4% this week" muted }
      card "Traffic over time"
        chart type=line h=160
      card "Recent users"
        table "Name | Role | Status; Ada | Eng | Active; Grace | PM | Away; Alan | Design | Active"`,
  },
  {
    name: "Signup form",
    source: `card "Create your account" w=360
  input "Full name" placeholder="Ada Lovelace"
  input "Email" placeholder="ada@example.com"
  input "Password" type=password
  toggle "Email me product updates" on
  row gap=8
    button "Cancel"
    spacer
    button "Sign up" primary`,
  },
  {
    name: "Mobile profile",
    source: `screen "Profile" size=320x560
  navbar "Profile"
  col pad=16 gap=14 align=center
    avatar size=90
    heading "Jane Doe"
    text "Product Designer" muted
    row gap=24
      col align=center { heading "128"; text "Posts" muted }
      col align=center { heading "8.2k"; text "Followers" muted }
      col align=center { heading "312"; text "Following" muted }
    button "Edit Profile" primary fill
    divider
    list "Settings, Notifications, Privacy, Help & Support, Log out"`,
  },
  {
    name: "Modal dialog",
    source: `modal "Delete project?" w=360
  text "This action cannot be undone. All files and history will be permanently removed."
  row gap=8
    spacer
    button "Cancel"
    button "Delete" primary`,
  },
  {
    name: "Interactive (click & scroll)",
    source: `# Click the dropdown, tabs, and checkboxes.
# The screen has fixed size, so its content scrolls (mouse wheel).
screen "Settings" size=380x420
  tabs "General | Account | Advanced" active=0
  col pad=16 gap=14
    heading "Preferences"
    select "Choose a theme" options="Light, Dark, System, High contrast"
    checkbox "Enable notifications" checked
    checkbox "Play sounds"
    toggle "Beta features" on
    divider
    heading "Danger zone"
    text "These settings affect your whole account and cannot easily be undone."
    button "Reset everything"
    text "Extra content below to demonstrate vertical scrolling within the fixed screen frame."
    input "Support PIN"
    button "Save changes" primary fill`,
  },

  {
    name: "File explorer (tree + table)",
    source: `screen "Project" size=760x520
  navbar "grafiq"
    tabs "Files | History" active=0
  row gap=16 fill
    sidebar w=210
      tree
        item "src" open
          item "components" open
            item "Button.tsx" selected
            item "Input.tsx"
          item "index.ts"
        item "package.json"
        item "README.md"
    col gap=12 fill
      heading "Team members"
      table "Name | Role | Access | 2FA" widths="3,2,2,1" align="left,left,center,center" zebra sort="0:asc"
        row "Ada Lovelace | Engineer | Admin | [x]" selected
        row "Grace Hopper | PM | Write | [x]"
        row "Alan Turing | Research | Read | [ ]"
        row "Katherine J. | Analyst | Read | [ ]"`,
  },
  {
    name: "Widgets",
    source: `heading "Widgets"

row gap=20 align=start
  col gap=10
    text "Feedback" muted
    row gap=6
      badge "New" variant=success
      badge "Beta" variant=warning
      badge "v2" variant=primary
    alert "Your trial ends in 3 days." title="Heads up" variant=warning
    row gap=6 { tag "React"; tag "TS" variant=primary }
    row gap=6 align=center { kbd "Ctrl"; text "+"; kbd "K" }
    skeleton lines=3
  col gap=10
    text "Navigation" muted
    breadcrumb "Home / Products / Shoes"
    pagination pages=5 active=1
    stepper "Cart | Shipping | Pay" active=1
    menubar "File | Edit | View"
    menu "Actions" items="Rename, Duplicate, Delete"
  col gap=10
    text "Data" muted
    row gap=16
      stat "Revenue" value="$3.2k" delta="+8%"
      stat "Churn" value="1.2%" delta="-3%"
    rating value=4
    button "Hover me" tooltip="This button has a tooltip"
    note "Annotations stay visible in exported PNGs."
accordion w=360
  item "What is this?"
    text "A hand-drawn mockup DSL. Click headers to expand."
  item "Is it interactive?"
    text "Yes — dropdowns, tabs, accordions and more."
  item "Can I export?"
    button "Download PNG" primary
calendar day=14 start=6 month="March 2025"`,
  },
  {
    name: "Kitchen sink",

    source: `heading "Components"
row gap=20 align=start
  col gap=10
    text "Buttons" muted
    button "Default"
    button "Primary" primary
    button "Disabled" disabled
  col gap=10
    text "Inputs" muted
    input placeholder="Text field"
    search placeholder="Search…"
    select "Choose one"
  col gap=10
    text "Choices" muted
    checkbox "Checkbox" checked
    radio "Radio" selected
    toggle "Toggle" on
    slider value=60
  col gap=10
    text "Data" muted
    progress value=70
    chart type=bar w=160 h=90
    image "caption" w=160 h=80`,
  },
];
