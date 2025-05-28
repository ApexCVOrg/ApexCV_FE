"use client";
import React from "react";
import { Button, Stack, Avatar } from "@mui/material";
import { useRouter } from "next/navigation";

const teams = [
  {
    name: "Arsenal",
    logo: "https://static.vecteezy.com/system/resources/previews/015/863/617/non_2x/arsenal-logo-on-transparent-background-free-vector.jpg",
    route: "arsenal",
  },
  {
    name: "Real Madrid",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    route: "real-madrid",
  },
  {
    name: "Manchester United",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    route: "manchester-united",
  },
  {
    name: "Juventus",
    logo: "https://dothethao.net.vn/wp-content/uploads/2020/06/logo-juventus.png",
    route: "juventus",
  },
  {
    name: "Bayern Munich",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/2048px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    route: "bayern-munich",
  },
];

const TeamButtonsMUI: React.FC = () => {
  const router = useRouter();

  return (
    <Stack alignItems="center" spacing={3} sx={{ mt: 4 }}>
      <Stack direction="row" spacing={4}>
        {teams.map((team) => (
          <Button
            key={team.name}
            onClick={() => router.push(`/en/men/${team.route}`)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 90,
              textTransform: "none",
              p: 1,
              bgcolor: "transparent",
              borderRadius: 2,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            <Avatar
              src={team.logo}
              alt={team.name}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#fff",
                border: "2px solid #eee",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                objectFit: "contain",
              }}
              variant="circular"
              imgProps={{
                style: { objectFit: "contain", background: "#fff" }
              }}
            />
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};

export default TeamButtonsMUI; 