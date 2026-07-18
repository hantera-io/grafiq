# icon

A hand-drawn pictogram. Pick one with `name=…` (or as the quoted text). Unknown
names fall back to a small labeled placeholder square.

```grafiq
row gap=12
  icon name=star
  icon name=home
  icon name=gear
  icon name=search
  icon name=bell
```

## Supported names

### General

```grafiq
col gap=10
  row gap=14
    icon name=star
    icon name=heart
    icon name=home
    icon name=gear
    icon name=search
    icon name=user
    icon name=bell
    icon name=mail
  row gap=14
    icon name=calendar
    icon name=clock
    icon name=bookmark
    icon name=globe
    icon name=camera
    icon name=image
    icon name=phone
    icon name=pin
```

`star heart home gear search user bell mail calendar clock bookmark globe camera image phone pin`

### Actions

```grafiq
col gap=10
  row gap=14
    icon name=check
    icon name=x
    icon name=plus
    icon name=minus
    icon name=trash
    icon name=edit
    icon name=download
    icon name=upload
  row gap=14
    icon name=refresh
    icon name=share
    icon name=filter
    icon name=link
    icon name=eye
    icon name=lock
    icon name=unlock
```

`check x plus minus trash edit download upload refresh share filter link eye lock unlock`

### Navigation & UI

```grafiq
col gap=10
  row gap=14
    icon name=menu
    icon name=dots
    icon name=arrow-up
    icon name=arrow-down
    icon name=arrow-left
    icon name=arrow-right
    icon name=chevron-up
    icon name=chevron-down
  row gap=14
    icon name=chevron-left
    icon name=chevron-right
    icon name=play
    icon name=pause
    icon name=info
    icon name=warning
    icon name=question
  row gap=14
    icon name=folder
    icon name=file
    icon name=cart
    icon name=chat
```

`menu dots arrow-up arrow-down arrow-left arrow-right chevron-up chevron-down chevron-left chevron-right play pause info warning question folder file cart chat`

Aliases: `settings→gear`, `person→user`, `notification→bell`, `email/envelope→mail`,
`time→clock`, `world→globe`, `photo→image`, `mobile→phone`, `location/marker→pin`,
`close→x`, `add→plus`, `delete→trash`, `pencil→edit`, `reload→refresh`,
`chain→link`, `hamburger→menu`, `more/kebab→dots`, `help→question`,
`document→file`, `shopping-cart→cart`, `message→chat`, `alert-triangle→warning`.

## Size

`size=…` (or `w=…`) sets the icon's box; default is 24.

```grafiq
row gap=12 align=center
  icon name=star size=16
  icon name=star size=24
  icon name=star size=36
  icon name=star size=48
```

## Color

`color=…` accepts the semantic variant names (`primary`, `success`, `warning`,
`danger`, `info`) or any CSS color.

```grafiq
row gap=12
  icon name=heart color=danger
  icon name=check color=success
  icon name=warning color=warning
  icon name=info color=primary
  icon name=star color=#8e44ad
```

## Fallback

Names without a pictogram render as the classic placeholder square:

```grafiq
row gap=12
  icon name=rocket
  icon name=unicorn
```
