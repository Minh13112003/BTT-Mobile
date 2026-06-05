// services/referral.ts

export interface ReferralStats {
  referralCode: string;
  successReferrals: number;
  earnedPoints: number;
}

export const getReferralStats = async (
  userLastName?: string,
): Promise<{ data: ReferralStats }> => {
  // Giả lập độ trễ của API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const code = userLastName
    ? `BTT${userLastName.toUpperCase()}2026`
    : "BTTDEMO2026";

  return {
    data: {
      referralCode: code,
      successReferrals: 5,
      earnedPoints: 1000000,
    },
  };

  //const response = await apiService.get(urls.URL_GetReferralStats);
  //return { data: response.data };
};
