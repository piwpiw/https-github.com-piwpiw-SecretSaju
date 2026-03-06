"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User as UserIcon, Heart, ArrowLeft, Loader2 } from "lucide-react";
import { SajuProfileRepository } from "@/lib/repositories/saju-profile.repository";
import { hasSufficientBalance, consumeJelly } from "@/lib/jelly-wallet";
import { triggerBalanceUpdate } from "@/components/shop/JellyBalance";
import JellyShopModal from "@/components/shop/JellyShopModal";
import { getUserFromCookie } from "@/lib/kakao-auth";
import { CalendarType, Gender, RelationshipType, CreateSajuProfileRequest } from "@/types/schema";
import { getSupabaseClient } from "@/lib/supabase";
import { useProfiles } from "@/components/ProfileProvider";

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: "self", label: "본인" },
  { value: "lover", label: "연인" },
  { value: "friend", label: "친구" },
  { value: "spouse", label: "배우자" },
  { value: "child", label: "자녀" },
  { value: "parent", label: "부모" },
  { value: "other", label: "기타" },
];

export default function AddSajuPage() {
  const router = useRouter();
  const { refreshProfiles } = useProfiles();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType>("self");
  const [birthdate, setBirthdate] = useState("");
  const [birthHour, setBirthHour] = useState("12");
  const [birthMinute, setBirthMinute] = useState("00");
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [gender, setGender] = useState<Gender>("female");
  const [showShopModal, setShowShopModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isNameEmpty = name.trim() === "";
  const isBirthDateEmpty = birthdate.trim() === "";
  const canSubmit = !isNameEmpty && !isBirthDateEmpty;

  const resolveUserId = async (): Promise<string> => {
    const supabase = getSupabaseClient();
    if (supabase?.auth?.getUser) {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) return data.user.id;
    }
    const cookieUser = getUserFromCookie();
    if (cookieUser?.id) return String(cookieUser.id);
    return "local-user";
  };

  const saveProfileAndNavigate = async (isFirst: boolean) => {
    const userId = await resolveUserId();

    const request: CreateSajuProfileRequest = {
      name: name.trim(),
      relationship,
      birthdate,
      birthTime: isTimeUnknown ? undefined : `${birthHour}:${birthMinute}`,
      isTimeUnknown,
      calendarType,
      isLeapMonth,
      gender,
    };

    const newProfile = await SajuProfileRepository.create(request, userId);

    if (!isFirst) {
      consumeJelly(1, "unlock_profile", { profileId: newProfile.id, profileName: name });
      triggerBalanceUpdate();
    }

    await refreshProfiles();
    router.push("/my-saju/list");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setFormError("이름과 생년월일은 필수 입력값입니다.");
      return;
    }

    if (name.trim().length < 2) {
      setFormError("이름은 2자 이상 입력해 주세요.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      const userId = await resolveUserId();
      const existingProfiles = await SajuProfileRepository.findByUserId(userId);
      const isFirst = existingProfiles.length === 0;

      if (!isFirst && !hasSufficientBalance(1)) {
        setShowShopModal(true);
        setIsSubmitting(false);
        return;
      }

      if (!isFirst) {
        setShowConfirmModal(true);
      } else {
        await saveProfileAndNavigate(true);
      }
    } catch (error) {
      console.error(error);
      setFormError("저장 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </button>

        <header className="mt-8 mb-8">
          <h1 className="text-3xl font-black">사주 데이터 등록</h1>
          <p className="text-sm text-slate-400 mt-2">프로필 정보를 입력하고 분석 대상에 추가합니다.</p>
        </header>

        {formError && <p className="text-rose-400 text-sm mb-4" role="alert">{formError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6" aria-label="사주 프로필 등록 폼">
          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-2">
              <UserIcon className="w-4 h-4" /> 이름
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="프로필 이름 입력"
              aria-describedby="profile-name-help"
              aria-invalid={!!isNameEmpty}
              className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3"
              placeholder="이름 입력"
            />
            <p id="profile-name-help" className="text-xs text-slate-400 mt-2">
              2자 이상 입력하면 이후 변경 시 유의미한 오차를 줄일 수 있습니다.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4" /> 관계
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="관계 선택">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={relationship === opt.value}
                  onClick={() => setRelationship(opt.value)}
                  className={`py-2 rounded-xl border ${
                    relationship === opt.value
                      ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-100"
                      : "bg-black/30 border-white/10 text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" /> 생년월일
              </label>
              <input
                id="birth-date"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                aria-label="생년월일 입력"
                aria-describedby="birthdate-help"
                aria-invalid={isBirthDateEmpty}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3"
              />
              <p id="birthdate-help" className="text-xs text-slate-400 mt-2">
                실제 생년월일을 기준으로 사주 계산 정확도가 높아집니다.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" /> 출생시각
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="birth-hour"
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  disabled={isTimeUnknown}
                  aria-label="출생 시"
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 disabled:opacity-50"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const v = String(i).padStart(2, "0");
                    return <option key={v} value={v}>{v}시</option>;
                  })}
                </select>
                <select
                  id="birth-minute"
                  value={birthMinute}
                  onChange={(e) => setBirthMinute(e.target.value)}
                  disabled={isTimeUnknown}
                  aria-label="출생 분"
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 disabled:opacity-50"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const v = String(i).padStart(2, "0");
                    return <option key={v} value={v}>{v}분</option>;
                  })}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300 mt-2">
                <input
                  type="checkbox"
                  checked={isTimeUnknown}
                  onChange={(e) => setIsTimeUnknown(e.target.checked)}
                  aria-label="출생 시간이 미상입니다"
                />
                시간 미상
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCalendarType("solar")}
              aria-pressed={calendarType === "solar"}
              className={`py-2 rounded-xl border ${calendarType === "solar" ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10 bg-black/30"}`}
            >
              양력
            </button>
            <button
              type="button"
              onClick={() => setCalendarType("lunar")}
              aria-pressed={calendarType === "lunar"}
              className={`py-2 rounded-xl border ${calendarType === "lunar" ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10 bg-black/30"}`}
            >
              음력
            </button>
            <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-2">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
                aria-label="윤달 여부"
              />
              윤달
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGender("female")}
              aria-pressed={gender === "female"}
              className={`py-2 rounded-xl border ${gender === "female" ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10 bg-black/30"}`}
            >
              여성
            </button>
            <button
              type="button"
              onClick={() => setGender("male")}
              aria-pressed={gender === "male"}
              className={`py-2 rounded-xl border ${gender === "male" ? "bg-indigo-500/20 border-indigo-400/40" : "border-white/10 bg-black/30"}`}
            >
              남성
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            aria-label={canSubmit ? "사주 저장" : "입력값을 먼저 완료해 주세요"}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "사주 저장"}
          </button>
        </form>

        <JellyShopModal
          isOpen={showShopModal}
          onClose={() => {
            setShowShopModal(false);
            setIsSubmitting(false);
          }}
          onPurchaseSuccess={() => {
            setShowShopModal(false);
            setShowConfirmModal(true);
          }}
        />

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h3 className="text-lg font-bold">프로필을 저장할까요?</h3>
              <p className="text-sm text-slate-400 mt-2">추가 프로필 저장 시 젤리 1개가 사용됩니다.</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setIsSubmitting(false);
                  }}
                  className="py-2 rounded-xl border border-white/10 bg-black/30"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await saveProfileAndNavigate(false);
                  }}
                  className="py-2 rounded-xl bg-indigo-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
