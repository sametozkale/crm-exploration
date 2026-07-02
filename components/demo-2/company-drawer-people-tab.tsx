import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { DEMO2_COMPANY_DRAWER_PEOPLE } from "./company-drawer-people-data"
import { cn } from "@/lib/utils"

const SALT = { fontFeatureSettings: '"salt" 1' } as const

type BestMatchContact = (typeof DEMO2_COMPANY_DRAWER_PEOPLE.bestMatchContacts)[number]

const CONTACT_ACTION_BUTTON =
  "inline-flex shrink-0 items-center rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-white drop-shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)] transition-colors duration-150 ease-out"

const CONTACT_ACTION_BUTTON_MUTED =
  "inline-flex shrink-0 items-center rounded-[8px] border-[0.5px] border-solid border-[#f2f2f2] bg-[#fafafa] p-2 opacity-50 drop-shadow-[0px_0px_0.5px_rgba(119,119,119,0.12)]"

type ContactActionIconVariant = "add" | "mail" | "call" | "more"

function ContactActionIcon({
  variant,
  src,
}: {
  variant: ContactActionIconVariant
  src: string
}) {
  if (variant === "more") {
    return (
      <div className="relative size-4 shrink-0 overflow-clip text-inherit">
        <div className="absolute bottom-[45.83%] left-1/4 right-[24.96%] top-1/2">
          <div className="absolute inset-[-150%_-12.49%_-50%_-12.49%]">
            <svg viewBox="0 0 10.006 2" fill="none" className="block size-full" aria-hidden>
              <path
                d="M4.9974 1H5.00338"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 1H9.00599"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 1H1.00599"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  const inset =
    variant === "add"
      ? "inset-[16.67%]"
      : variant === "mail"
        ? "inset-[10.42%_8.35%_10.42%_8.33%]"
        : "inset-[8.33%]"

  return (
    <div className="relative size-3 shrink-0 overflow-clip">
      <div className={cn("absolute", inset)}>
        <img src={src} alt="" className="block size-full max-w-none" draggable={false} />
      </div>
    </div>
  )
}

type TeamLegendItem = (typeof DEMO2_COMPANY_DRAWER_PEOPLE.teamComposition.legend)[number]

const DONUT_SIZE = 164
const DONUT_CENTER = DONUT_SIZE / 2
const DONUT_OUTER_RADIUS = 78
const DONUT_INNER_RADIUS = 64
const DONUT_GAP_DEG = 2
const TEAM_HOVER_DIM_OPACITY = 0.3
const TEAM_HOVER_TRANSITION = "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)"

function teamHoverOpacity(hoveredIndex: number | null, index: number) {
  return hoveredIndex === null || hoveredIndex === index ? 1 : TEAM_HOVER_DIM_OPACITY
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle)
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle)
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle)
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ")
}

function TeamCompositionDonut({
  legend,
  hoveredIndex,
  onHover,
}: {
  legend: readonly TeamLegendItem[]
  hoveredIndex: number | null
  onHover: (index: number) => void
}) {
  const total = legend.reduce((sum, item) => sum + item.count, 0)
  let currentAngle = 0

  const segments = legend.map((item) => {
    const sweep = (item.count / total) * 360
    const gap = legend.length > 1 ? DONUT_GAP_DEG : 0
    const segmentStart = currentAngle + gap / 2
    const segmentEnd = currentAngle + sweep - gap / 2
    currentAngle += sweep

    return {
      color: item.color,
      path:
        segmentEnd > segmentStart
          ? describeDonutSegment(
              DONUT_CENTER,
              DONUT_CENTER,
              DONUT_OUTER_RADIUS,
              DONUT_INNER_RADIUS,
              segmentStart,
              segmentEnd,
            )
          : null,
    }
  })

  return (
    <svg
      width={DONUT_SIZE}
      height={DONUT_SIZE}
      viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
      className="size-[164px] shrink-0"
      aria-hidden
    >
      {segments.map((segment, index) =>
        segment.path ? (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            className="cursor-pointer"
            style={{
              opacity: teamHoverOpacity(hoveredIndex, index),
              transition: TEAM_HOVER_TRANSITION,
            }}
            onMouseEnter={() => onHover(index)}
          />
        ) : null,
      )}
      <circle cx={DONUT_CENTER} cy={DONUT_CENTER} r={DONUT_INNER_RADIUS - 1} fill="white" />
      <foreignObject
        x={DONUT_CENTER - 52}
        y={DONUT_CENTER - 28}
        width={104}
        height={56}
        style={{
          opacity: hoveredIndex === null ? 1 : 0.45,
          transition: TEAM_HOVER_TRANSITION,
        }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <span className="text-[12px] font-medium leading-4 text-[#6f6f77]">Total</span>
          <span className="text-[24px] font-semibold leading-8 text-[#323232]">
            {total.toLocaleString()}
          </span>
        </div>
      </foreignObject>
    </svg>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3
      className="text-[11px] uppercase leading-[14px] tracking-[-0.11px] text-[#969696]"
      style={SALT}
    >
      {children}
    </h3>
  )
}

function BestMatchContactRole({ contact }: { contact: BestMatchContact }) {
  const { icons } = DEMO2_COMPANY_DRAWER_PEOPLE

  return (
    <div className="flex flex-col items-end justify-center gap-1.5">
      <div className="flex items-start gap-[6px]">
        <div className="relative size-4 shrink-0 overflow-clip">
          <div className="absolute inset-[12.5%_8.33%]">
            <img
              src={icons.userAccount}
              alt=""
              className="block size-full max-w-none"
              draggable={false}
            />
          </div>
        </div>
        <span className="whitespace-nowrap text-[12px] leading-normal text-[#969696]">
          {contact.role}
        </span>
      </div>
      <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.24px] text-[#aaa]">
        {contact.tenure}
      </span>
    </div>
  )
}

type ContactMenuAnchor = {
  x: number
  y: number
  align: "more" | "context"
}

const CONTACT_MORE_MENU_ITEMS = [
  {
    id: "decision-maker",
    label: "Make key decision maker",
    iconKey: "menuUserStar" as const,
    credit: null,
    layout: "plain" as const,
  },
  {
    id: "email",
    label: "Get email address",
    iconKey: "menuMail" as const,
    credit: "1 credit",
    layout: "credit-between" as const,
  },
  {
    id: "phone",
    label: "Get phone number",
    iconKey: "menuCall" as const,
    credit: "0.5 credit",
    layout: "credit-inline" as const,
  },
  {
    id: "remove",
    label: "Remove",
    iconKey: "menuUserRemove" as const,
    credit: null,
    layout: "plain" as const,
  },
]

type ContactMenuIconVariant = "menuUserStar" | "menuMail" | "menuCall" | "menuUserRemove"

function ContactMenuIcon({
  variant,
  src,
}: {
  variant: ContactMenuIconVariant
  src: string
}) {
  const inset =
    variant === "menuMail"
      ? "inset-[10.42%_8.35%_10.42%_8.33%]"
      : "inset-[8.33%]"

  const scaleInset =
    variant === "menuMail" ? "inset-[-3.95%_-3.74%]" : "inset-[-3.75%_-3.76%_-3.75%_-3.74%]"

  return (
    <div className="relative size-4 shrink-0 overflow-clip">
      <div className={cn("absolute", inset)}>
        <div className={cn("absolute", scaleInset)}>
          <img src={src} alt="" className="block size-full max-w-none" draggable={false} />
        </div>
      </div>
    </div>
  )
}

function ContactMoreMenu({
  menuRef,
  anchor,
  onClose,
  isKeyDecisionMaker,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>
  anchor: ContactMenuAnchor
  onClose: () => void
  isKeyDecisionMaker: boolean
}) {
  const { icons } = DEMO2_COMPANY_DRAWER_PEOPLE
  const menuItems = CONTACT_MORE_MENU_ITEMS.filter(
    (item) => !(isKeyDecisionMaker && item.id === "decision-maker"),
  )
  const [hoveredId, setHoveredId] = useState(menuItems[0]?.id ?? null)

  return (
    <div
      ref={menuRef}
      className="absolute z-50 flex w-max flex-col items-start rounded-[12px] border border-solid border-[#f7f7f7] bg-white p-1 shadow-[0px_1px_2px_rgba(34,34,34,0.05)]"
      style={{
        left: anchor.x,
        top: anchor.y,
        transform: anchor.align === "more" ? "translateX(-100%)" : undefined,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {menuItems.map((item) => {
        const highlighted = hoveredId === item.id
        const icon = icons[item.iconKey]

        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              "overflow-clip rounded-[8px] px-2 py-1.5 text-left transition-colors duration-150 ease-out",
              item.layout === "credit-between" && "flex w-full items-center justify-between",
              item.layout === "credit-inline" && "flex items-center gap-2",
              item.layout === "plain" && "flex w-full items-start gap-2",
              highlighted ? "bg-[#f7f7f7]" : "hover:bg-[#f7f7f7]",
            )}
            onMouseEnter={() => setHoveredId(item.id)}
            onClick={onClose}
          >
            <span
              className={cn(
                "flex min-w-0 items-center gap-2",
                item.layout === "plain" && "items-start",
              )}
            >
              <ContactMenuIcon variant={item.iconKey} src={icon} />
              <span
                className={cn(
                  "whitespace-nowrap text-[13px] leading-normal tracking-[0.13px]",
                  highlighted && item.id === "decision-maker" ? "text-[#646464]" : "text-[#777]",
                )}
              >
                {item.label}
              </span>
            </span>
            {item.credit ? (
              <span
                className="shrink-0 rounded-[6px] bg-[rgba(0,144,255,0.07)] px-1 py-0.5 text-[10px] font-medium leading-normal tracking-[-0.2px] text-[#0090ff]"
                style={SALT}
              >
                {item.credit}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function ContactCreditPopover({
  label,
  credit,
  align = "end",
  popoverRef,
}: {
  label: string
  credit?: string | null
  align?: "center" | "end"
  popoverRef?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={popoverRef}
      className={cn(
        "pointer-events-none absolute bottom-full z-50 mb-1.5",
        align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
      )}
      role="tooltip"
    >
      <div
        className={cn(
          "flex items-center whitespace-nowrap rounded-[6px] bg-[#414349] py-[5px] text-white",
          credit ? "gap-1 pl-2 pr-[5px]" : "px-2",
        )}
      >
        <span className="text-[13px] font-medium leading-normal tracking-[-0.13px]">
          {label}
        </span>
        {credit ? (
          <span
            className="rounded-[6px] bg-[rgba(255,255,255,0.12)] px-1 py-0.5 text-[10px] font-medium leading-normal tracking-[-0.2px]"
            style={SALT}
          >
            {credit}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function DisabledContactActionButton({
  label,
  popoverLabel,
  popoverActiveLabel,
  popoverCredit,
  icon,
  iconVariant,
  resetKey,
}: {
  label: string
  popoverLabel: string
  popoverActiveLabel: string
  popoverCredit: string
  icon: string
  iconVariant: Extract<ContactActionIconVariant, "mail" | "call">
  resetKey: number
}) {
  const [hovered, setHovered] = useState(false)
  const [available, setAvailable] = useState(false)
  const [popoverAlign, setPopoverAlign] = useState<"center" | "end">("end")
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAvailable(false)
  }, [resetKey])

  useLayoutEffect(() => {
    if (!hovered) {
      setPopoverAlign("end")
      return
    }

    const button = buttonRef.current
    const popover = popoverRef.current
    const drawer = button?.closest("aside")
    if (!button || !popover || !drawer) {
      setPopoverAlign("end")
      return
    }

    const drawerRect = drawer.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    const popoverWidth = popover.offsetWidth
    const buttonCenterX = buttonRect.left + buttonRect.width / 2
    const popoverLeft = buttonCenterX - popoverWidth / 2
    const popoverRight = buttonCenterX + popoverWidth / 2
    const fitsInDrawer =
      popoverLeft >= drawerRect.left && popoverRight <= drawerRect.right

    setPopoverAlign(fitsInDrawer ? "center" : "end")
  }, [hovered, available])

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-pressed={available}
        onClick={() => setAvailable(true)}
        className={cn(
          "p-2 transition-[opacity,background-color,border-color,box-shadow] duration-150 ease-out",
          available ? CONTACT_ACTION_BUTTON : cn(CONTACT_ACTION_BUTTON_MUTED, "cursor-pointer"),
        )}
      >
        <ContactActionIcon variant={iconVariant} src={icon} />
      </button>
      {hovered ? (
        <ContactCreditPopover
          popoverRef={popoverRef}
          align={popoverAlign}
          label={available ? popoverActiveLabel : popoverLabel}
          credit={available ? null : popoverCredit}
        />
      ) : null}
    </div>
  )
}

function BestMatchContactActions({
  moreButtonRef,
  onMoreClick,
  resetKey,
}: {
  moreButtonRef: React.RefObject<HTMLButtonElement | null>
  onMoreClick: () => void
  resetKey: number
}) {
  const { icons } = DEMO2_COMPANY_DRAWER_PEOPLE

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={cn(CONTACT_ACTION_BUTTON, "gap-1.5 px-2 py-[7px]")}
      >
        <ContactActionIcon variant="add" src={icons.add} />
        <span className="whitespace-nowrap text-[12px] leading-[14px] tracking-[-0.12px] text-[#323232]">
          Add to list
        </span>
      </button>
      <DisabledContactActionButton
        label="Email"
        popoverLabel="Get email address"
        popoverActiveLabel="Copy email"
        popoverCredit="1 credit"
        icon={icons.mail}
        iconVariant="mail"
        resetKey={resetKey}
      />
      <DisabledContactActionButton
        label="Call"
        popoverLabel="Get phone number"
        popoverActiveLabel="Copy phone number"
        popoverCredit="0.5 credit"
        icon={icons.call}
        iconVariant="call"
        resetKey={resetKey}
      />
      <button
        ref={moreButtonRef}
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        className={cn(
          CONTACT_ACTION_BUTTON,
          "p-1.5 text-[#969696] transition-colors duration-150 ease-out hover:text-[#323232]",
        )}
        onClick={(event) => {
          event.stopPropagation()
          onMoreClick()
        }}
      >
        <ContactActionIcon variant="more" src={icons.more} />
      </button>
    </div>
  )
}

function BestMatchContactCard({ contact }: { contact: BestMatchContact }) {
  const { icons } = DEMO2_COMPANY_DRAWER_PEOPLE
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<ContactMenuAnchor | null>(null)
  const [actionsResetKey, setActionsResetKey] = useState(0)
  const showActions = hovered || menuOpen

  const closeMenu = () => {
    setMenuOpen(false)
    setMenuAnchor(null)
  }

  const handleWrapperMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null
    if (nextTarget && wrapperRef.current?.contains(nextTarget)) return

    setHovered(false)
    if (!menuOpen) setActionsResetKey((key) => key + 1)
  }

  const openMenuFromMore = () => {
    if (!cardRef.current || !moreButtonRef.current) return

    const cardRect = cardRef.current.getBoundingClientRect()
    const moreRect = moreButtonRef.current.getBoundingClientRect()

    setMenuAnchor({
      x: moreRect.right - cardRect.left,
      y: moreRect.bottom - cardRect.top + 4,
      align: "more",
    })
    setMenuOpen(true)
  }

  const openMenuFromContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!cardRef.current) return

    const cardRect = cardRef.current.getBoundingClientRect()

    setMenuAnchor({
      x: event.clientX - cardRect.left,
      y: event.clientY - cardRect.top,
      align: "context",
    })
    setMenuOpen(true)
  }

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        menuRef.current?.contains(target) ||
        moreButtonRef.current?.contains(target) ||
        wrapperRef.current?.contains(target)
      ) {
        return
      }
      closeMenu()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu()
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuOpen])

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleWrapperMouseLeave}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative flex items-center justify-between rounded-[12px] border border-solid px-4 py-3 transition-colors duration-150 ease-out",
          showActions ? "border-[#eee]" : "border-[#f4f4f4]",
        )}
        onContextMenu={openMenuFromContext}
      >
        <div className="flex min-w-0 items-start gap-3">
          <img
            src={contact.avatar}
            alt=""
            className="size-6 shrink-0 rounded-full object-cover"
            draggable={false}
          />
          <div className="flex min-w-0 flex-col justify-center gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[13px] font-medium leading-normal text-[#323232]">
              {contact.name}
            </span>
            {"badge" in contact && contact.badge ? (
              <span className="inline-flex items-center gap-1 rounded-[6px] bg-[rgba(0,205,113,0.07)] px-[5px] py-0.5">
                <img src={icons.userStar} alt="" className="size-2.5 shrink-0" draggable={false} />
                <span
                  className="whitespace-nowrap text-[10px] font-medium tracking-[-0.2px] text-[#00cd71]"
                  style={SALT}
                >
                  {contact.badge}
                </span>
              </span>
            ) : null}
          </div>
          <span className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
            {contact.location}
          </span>
        </div>
      </div>

      <div className="relative flex min-h-10 shrink-0 items-center justify-end">
        <div
          className={cn(
            "transition-opacity duration-150 ease-out",
            showActions ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <BestMatchContactRole contact={contact} />
        </div>
        <div
          className={cn(
            "absolute right-0 top-1/2 flex -translate-y-1/2 items-center transition-opacity duration-150 ease-out",
            showActions ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <BestMatchContactActions
            moreButtonRef={moreButtonRef}
            onMoreClick={openMenuFromMore}
            resetKey={actionsResetKey}
          />
        </div>
      </div>
      </div>

      {menuOpen && menuAnchor ? (
        <ContactMoreMenu
          menuRef={menuRef}
          anchor={menuAnchor}
          onClose={closeMenu}
          isKeyDecisionMaker={"badge" in contact && Boolean(contact.badge)}
        />
      ) : null}
    </div>
  )
}

function BestMatchContactsSection() {
  const contacts = DEMO2_COMPANY_DRAWER_PEOPLE.bestMatchContacts

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Best Match Contacts</SectionTitle>
      <div className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <BestMatchContactCard key={contact.id} contact={contact} />
        ))}
      </div>
    </section>
  )
}

function TeamCompositionSection() {
  const { legend } = DEMO2_COMPANY_DRAWER_PEOPLE.teamComposition
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Team Composition</SectionTitle>
      <div
        className="flex items-center gap-12 rounded-[12px] border border-solid border-[#f4f4f4] p-6"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <TeamCompositionDonut
          legend={legend}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
        />
        <div className="flex w-[252px] flex-col justify-between gap-3">
          {legend.map((item, index) => (
            <div
              key={item.label}
              className="flex cursor-pointer items-center justify-between"
              style={{
                opacity: teamHoverOpacity(hoveredIndex, index),
                transition: TEAM_HOVER_TRANSITION,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#777]">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#ccc]">
                  {item.count}
                </span>
                <span className="w-8 text-right text-[12px] leading-4 tracking-[-0.24px] text-[#646464]">
                  {item.percent}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EmployeeGrowthChart({
  dataPoints,
}: {
  dataPoints: readonly { month: string; employees: number }[]
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const chartWidth = 464
  const chartHeight = 105
  const paddingY = 10
  const minEmployees = Math.min(...dataPoints.map((point) => point.employees))
  const maxEmployees = Math.max(...dataPoints.map((point) => point.employees))
  const range = maxEmployees - minEmployees || 1

  const points = dataPoints.map((point, index) => {
    const x =
      dataPoints.length === 1
        ? chartWidth / 2
        : (index / (dataPoints.length - 1)) * chartWidth
    const y =
      chartHeight -
      paddingY -
      ((point.employees - minEmployees) / range) * (chartHeight - paddingY * 2)
    return { ...point, x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1]!.x} ${chartHeight} L 0 ${chartHeight} Z`
  const hoveredPoint = hoveredIndex === null ? null : points[hoveredIndex]

  return (
    <div
      className="relative h-[105px] w-full"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        className="block"
        aria-hidden
      >
        <defs>
          <linearGradient id="employee-growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0090ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0090ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#employee-growth-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#0090ff"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {hoveredPoint ? (
          <>
            <line
              x1={hoveredPoint.x}
              x2={hoveredPoint.x}
              y1={hoveredPoint.y}
              y2={chartHeight}
              stroke="#0090ff"
              strokeOpacity="0.2"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="3.5"
              fill="#0090ff"
              stroke="white"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>

      <div className="absolute inset-0 flex">
        {dataPoints.map((point, index) => (
          <button
            key={point.month}
            type="button"
            aria-label={`${point.month}: ${point.employees} employees`}
            className="h-full flex-1 cursor-pointer border-0 bg-transparent p-0"
            onMouseEnter={() => setHoveredIndex(index)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
          />
        ))}
      </div>

      {hoveredPoint ? (
        <div
          className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-[8px] border border-solid border-[#f4f4f4] bg-white px-2 py-1.5 shadow-[0px_2px_8px_0px_rgba(34,34,34,0.08)]"
          style={{
            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
            top: `${(hoveredPoint.y / chartHeight) * 100}%`,
            marginTop: -8,
          }}
        >
          <p className="whitespace-nowrap text-[11px] font-medium leading-4 tracking-[-0.22px] text-[#323232]">
            {hoveredPoint.month}
          </p>
          <p className="whitespace-nowrap text-[11px] leading-4 tracking-[-0.22px] text-[#6f6f77]">
            {hoveredPoint.employees.toLocaleString()} employees
          </p>
        </div>
      ) : null}
    </div>
  )
}

function EmployeeGrowthSection() {
  const { totalEmployees, period, growthBadge, dataPoints } =
    DEMO2_COMPANY_DRAWER_PEOPLE.employeeGrowth

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Employee Growth</SectionTitle>
      <div className="flex flex-col gap-4 rounded-[12px] border border-solid border-[#f4f4f4] p-6">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-medium leading-[22px] tracking-[-0.32px] text-[#323232]">
            {totalEmployees}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#6f6f77]">
              {period}
            </span>
            <span
              className="rounded-[6px] bg-[rgba(102,220,126,0.1)] px-[6px] py-[2px] text-[12px] font-medium leading-4 tracking-[-0.24px] text-[#00cd71]"
              style={SALT}
            >
              {growthBadge}
            </span>
          </div>
        </div>
        <EmployeeGrowthChart dataPoints={dataPoints} />
        <div className="flex justify-between">
          {dataPoints.map((point) => (
            <span
              key={point.month}
              className="text-[12px] leading-4 tracking-[-0.24px] text-[#969696]"
            >
              {point.month}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function RecentHiresSection() {
  const hires = DEMO2_COMPANY_DRAWER_PEOPLE.recentHires

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Recent Hires</SectionTitle>
      <div className="flex flex-col gap-2">
        {hires.map((hire, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-[12px] border border-solid border-[#f4f4f4] px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <img
                src={hire.avatar}
                alt=""
                className="size-6 shrink-0 rounded-full object-cover"
                draggable={false}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium leading-[18px] tracking-[-0.26px] text-[#323232]">
                  {hire.name}
                </span>
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
                  {hire.location}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="inline-flex items-center gap-1">
                <img
                  src={hire.companyIcon}
                  alt=""
                  className="size-3 shrink-0 -scale-x-100 -rotate-180 object-contain"
                  draggable={false}
                />
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#969696]">
                  {hire.company}
                </span>
              </span>
              <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#aaa]">
                {hire.hiredAgo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CompanyDrawerPeopleTab() {
  return (
    <div className="flex w-[512px] shrink-0 flex-col gap-6 pb-6">
      <BestMatchContactsSection />
      <TeamCompositionSection />
      <EmployeeGrowthSection />
      <RecentHiresSection />
    </div>
  )
}
