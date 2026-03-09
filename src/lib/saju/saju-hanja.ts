export type FiveElementDefinition = {
  name: string;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
  desc: string;
  icon: string;
};

export const FIVE_ELEMENTS: FiveElementDefinition[] = [
  {
    name: "\uBAA9(\u6728)",
    color: "from-green-500 to-emerald-600",
    bg: "bg-emerald-500/20",
    borderColor: "border-emerald-500/50",
    textColor: "text-emerald-400",
    desc: "\uC131\uC7A5\u00B7\uCC3D\uC870\u00B7\uC2DC\uC791",
    icon: "\uD83C\uDF33",
  },
  {
    name: "\uD654(\u706B)",
    color: "from-red-500 to-rose-600",
    bg: "bg-rose-500/20",
    borderColor: "border-rose-500/50",
    textColor: "text-rose-400",
    desc: "\uC5F4\uC815\u00B7\uD45C\uD604\u00B7\uB9AC\uB354\uC2ED",
    icon: "\uD83D\uDD25",
  },
  {
    name: "\uD1A0(\u571F)",
    color: "from-yellow-400 to-amber-600",
    bg: "bg-amber-500/20",
    borderColor: "border-amber-500/50",
    textColor: "text-amber-400",
    desc: "\uC548\uC815\u00B7\uC870\uD654\u00B7\uC911\uC7AC",
    icon: "\u26F0\uFE0F",
  },
  {
    name: "\uAE08(\u91D1)",
    color: "from-slate-100 to-zinc-300",
    bg: "bg-white/10",
    borderColor: "border-white/30",
    textColor: "text-white",
    desc: "\uACB0\uB2E8\u00B7\uC815\uC758\u00B7\uADDC\uCE59",
    icon: "\uD83D\uDC8E",
  },
  {
    name: "\uC218(\u6C34)",
    color: "from-blue-600 to-indigo-900",
    bg: "bg-indigo-500/20",
    borderColor: "border-indigo-500/50",
    textColor: "text-indigo-400",
    desc: "\uC9C0\uD61C\u00B7\uC720\uC5F0\uC131\u00B7\uD1B5\uCC30",
    icon: "\uD83D\uDCA7",
  },
];

export const STEM_HANJA: Record<string, string> = {
  "\uAC11": "\u7532",
  "\uC744": "\u4E59",
  "\uBCD1": "\u4E19",
  "\uC815": "\u4E01",
  "\uBB34": "\u620A",
  "\uAE30": "\u5DF1",
  "\uACBD": "\u5E9A",
  "\uC2E0": "\u8F9B",
  "\uC784": "\u58EC",
  "\uACC4": "\u7678",
};

export const BRANCH_HANJA: Record<string, string> = {
  "\uC790": "\u5B50",
  "\uCD95": "\u4E11",
  "\uC778": "\u5BC5",
  "\uBB18": "\u536F",
  "\uC9C4": "\u8FB0",
  "\uC0AC": "\u5DF3",
  "\uC624": "\u5348",
  "\uBBF8": "\u672A",
  "\uC2E0": "\u7533",
  "\uC720": "\u9149",
  "\uC220": "\u620C",
  "\uD574": "\u4EA5",
};

export const ELEMENT_MAP: Record<string, number> = {
  "\uBAA9": 0,
  "\uD654": 1,
  "\uD1A0": 2,
  "\uAE08": 3,
  "\uC218": 4,
};

export type ElementRemedy = {
  color: string;
  items: string;
  direction: string;
  numbers: string;
};

export const ELEMENT_REMEDIES: Record<string, ElementRemedy> = {
  "\uBAA9": {
    color: "\uCCAD\uC0C9, \uCD08\uB85D\uC0C9",
    items: "\uB098\uBB34 \uC18C\uD488, \uCC45, \uC2DD\uBB3C",
    direction: "\uB3D9\uCABD",
    numbers: "3, 8",
  },
  "\uD654": {
    color: "\uC801\uC0C9, \uBD84\uD64D\uC0C9",
    items: "\uC870\uBA85, \uC720\uB9AC \uC18C\uD488, \uD5A5",
    direction: "\uB0A8\uCABD",
    numbers: "2, 7",
  },
  "\uD1A0": {
    color: "\uD669\uC0C9, \uBE0C\uB77C\uC6B4",
    items: "\uB3C4\uC790\uAE30, \uD761 \uC18C\uD488, \uD06C\uB9BC\uC0C9",
    direction: "\uC911\uC559",
    numbers: "5, 10",
  },
  "\uAE08": {
    color: "\uBC31\uC0C9, \uAE08\uC18D\uC0C9",
    items: "\uAE08\uC18D \uC18C\uD488, \uC2DC\uACC4, \uC2E4\uBC84 \uC545\uC138\uC11C\uB9AC",
    direction: "\uC11C\uCABD",
    numbers: "4, 9",
  },
  "\uC218": {
    color: "\uD751\uC0C9, \uCCAD\uC0C9",
    items: "\uBB3C \uC18C\uD488, \uAC70\uC6B8, \uD30C\uB791 \uD328\uD134",
    direction: "\uBD81\uCABD",
    numbers: "1, 6",
  },
};
