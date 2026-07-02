import { DEMO2_COMPANY_DRAWER_SIGNALS } from "./company-drawer-signals-data"

const SALT = { fontFeatureSettings: '"salt" 1' } as const

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

function KeySignalsSection() {
  const signals = DEMO2_COMPANY_DRAWER_SIGNALS.keySignals

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Key Signals</SectionTitle>
      <div className="flex flex-col gap-2">
        {signals.map((signal) => (
          <div
            key={signal.title}
            className="flex cursor-pointer items-start rounded-[12px] border border-solid border-[#f4f4f4] px-4 py-3 transition-colors duration-150 ease-out hover:border-[#eee]"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex shrink-0 rounded-[8px] p-1.5"
                style={{ backgroundColor: signal.iconBg }}
              >
                <img
                  src={signal.icon}
                  alt=""
                  className="size-3 shrink-0 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[18px] tracking-[-0.26px] text-[#323232]">
                  {signal.title}
                </span>
                <span className="text-[12px] leading-4 tracking-[-0.24px] text-[#838383]">
                  {signal.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function NewsCard({
  image,
  title,
  source,
  postedAgo,
}: {
  image: string
  title: string
  source: string
  postedAgo: string
}) {
  return (
    <article className="flex w-[252px] shrink-0 cursor-pointer flex-col rounded-[16px] border border-solid border-[#f4f4f4] bg-white p-[17px] transition-colors duration-150 ease-out hover:border-[#eee]">
      <div className="mb-4 h-[123px] w-[218px] overflow-hidden rounded-[8px]">
        <img
          src={image}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      </div>
      <h4 className="mb-2 text-[13px] font-medium leading-[18px] tracking-[-0.26px] text-[#1a1a3c]">
        {title}
      </h4>
      <p className="flex items-center gap-1 text-[12px] leading-4 tracking-[-0.24px] text-[#aaa]">
        <span>{source}</span>
        <span className="text-[#6e729e] opacity-70">·</span>
        <span>{postedAgo}</span>
      </p>
    </article>
  )
}

function RecentNewsSection() {
  const news = DEMO2_COMPANY_DRAWER_SIGNALS.recentNews
  const rows = [news.slice(0, 2), news.slice(2, 4)]

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>Recent News</SectionTitle>
      <div className="flex flex-col gap-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((item) => (
              <NewsCard key={item.title} {...item} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export function CompanyDrawerSignalsTab() {
  return (
    <div className="flex w-[512px] shrink-0 flex-col gap-6">
      <KeySignalsSection />
      <RecentNewsSection />
    </div>
  )
}
