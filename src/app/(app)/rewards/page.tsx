import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Trophy, Star, Gift, Sparkles } from "lucide-react";

async function getPoints(userId: string): Promise<number> {
  const completed = await prisma.checklistItem.count({
    where: { userId, done: true },
  });
  return completed * 10;
}

const REWARDS = [
  { label: "Movie Night", pts: 200, icon: Star, description: "A cozy movie night together" },
  { label: "Nice Dinner Out", pts: 500, icon: Gift, description: "Dinner at a nice restaurant" },
  { label: "Weekend Getaway", pts: 1000, icon: Trophy, description: "A romantic weekend trip" },
];

export default async function Rewards() {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (!token) redirect("/login");
  const session = await verifyJwt(token);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, partnerId: true },
  });
  if (!user) redirect("/login");

  const myPoints = await getPoints(user.id);
  let partnerPoints = 0;
  let partnerName: string | null = null;

  if (user.partnerId) {
    const partner = await prisma.user.findUnique({
      where: { id: user.partnerId },
      select: { name: true },
    });
    partnerName = partner?.name ?? null;
    partnerPoints = await getPoints(user.partnerId);
  }

  const totalPoints = myPoints + partnerPoints;
  const nextReward = REWARDS.find((r) => r.pts > totalPoints) || REWARDS[REWARDS.length - 1];
  const nextRewardProgress = totalPoints / nextReward.pts * 100;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Rewards</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-4xl font-bold text-brand-600">{myPoints}</div>
              <div className="text-xs text-muted-foreground mt-1">Your points</div>
            </CardContent>
          </Card>
          {partnerName && (
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-4xl font-bold text-partner-600">{partnerPoints}</div>
                <div className="text-xs text-muted-foreground mt-1">{partnerName}&apos;s points</div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="text-center mb-6 bg-gradient-to-br from-brand-50 to-partner-50 border-brand-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-brand-600" />
              <p className="text-xs text-muted-foreground">Couple total</p>
            </div>
            <div className="text-5xl font-bold text-foreground mb-1">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">10 pts per completed task</p>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Next reward</p>
                <p className="text-xs text-muted-foreground">{nextReward.label} at {nextReward.pts} pts</p>
              </div>
              <span className="text-sm font-semibold text-brand-600">
                {Math.round(nextRewardProgress)}%
              </span>
            </div>
            <Progress value={nextRewardProgress} variant="brand" size="md" />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-partner-500" />
            Reward Vault
          </h2>
          {REWARDS.map(({ label, pts, icon: Icon, description }, index) => {
            const unlocked = totalPoints >= pts;
            return (
              <Card 
                key={label}
                className={`transition-all duration-200 ${unlocked ? 'border-brand-200 bg-brand-50/50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${unlocked ? 'bg-brand-100 text-brand-600' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-muted-foreground">{pts} pts</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        unlocked 
                          ? 'bg-brand-100 text-brand-700' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Complete tasks together to earn points and unlock couple rewards!
        </p>
      </div>
    </div>
  );
}