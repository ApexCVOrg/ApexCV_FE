"use client";
import { Box, Typography, Card, CardMedia, CardContent, Button, Stack, Tabs, Tab, Avatar } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

export interface TeamInfo {
  name: string;
  route: string;
  logo: string;
}

export interface ProductInfo {
  name: string;
  price: string;
  image: string;
  desc: string;
}

interface TeamLayoutProps {
  children: React.ReactNode;
}

const teams: TeamInfo[] = [
  {
    name: "Arsenal",
    route: "arsenal",
    logo: "https://static.vecteezy.com/system/resources/previews/015/863/617/non_2x/arsenal-logo-on-transparent-background-free-vector.jpg",
  },
  {
    name: "Real Madrid",
    route: "real-madrid",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  },
  {
    name: "Manchester United",
    route: "manchester-united",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  },
  {
    name: "Juventus",
    route: "juventus",
    logo: "https://dothethao.net.vn/wp-content/uploads/2020/06/logo-juventus.png",
  },
  {
    name: "Bayern Munich",
    route: "bayern-munich",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/2048px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
  },
];

const tabColors: Record<string, string> = {
  "arsenal": "#EF3340",
  "real-madrid": "#00529F",
  "manchester-united": "#DA291C",
  "juventus": "#000",
  "bayern-munich": "#DC052D",
};

const TeamLayout = ({ children }: TeamLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isMenRoot = /\/men(\/?$)/.test(pathname); // true nếu là /en/men hoặc /en/men/
  const currentTeam = teams.findIndex((t) => pathname.endsWith(t.route));
  const tabColor = currentTeam !== -1 ? tabColors[teams[currentTeam].route] : "#1976d2";

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", px: { xs: 1, md: 4 }, py: 4 }}>
      {!isMenRoot && (
        <Stack direction="row" justifyContent="center" alignItems="center" mb={3} spacing={2}>
          <Tabs value={currentTeam} textColor="primary" indicatorColor="primary">
            {teams.map((team, idx) => (
              <Tab
                key={team.route}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={team.logo} alt={team.name} sx={{ width: 24, height: 24, bgcolor: '#fff', border: '1px solid #eee' }} />
                    <Typography fontWeight={700}>{team.name}</Typography>
                  </Box>
                }
                onClick={() => router.push(`/en/men/${team.route}`)}
                sx={{
                  fontWeight: currentTeam === idx ? 700 : 400,
                  color: currentTeam === idx ? tabColor : "inherit",
                  textTransform: "none",
                  minWidth: 120,
                }}
              />
            ))}
          </Tabs>
        </Stack>
      )}
      {children}
    </Box>
  );
};

export default TeamLayout; 