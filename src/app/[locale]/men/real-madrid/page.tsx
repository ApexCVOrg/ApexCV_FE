"use client";
import { Box, Typography, Card, CardMedia, CardContent, Button, Stack, Tabs, Tab, Avatar } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

const teams = [
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
    logo: "https://standfirst-designweek-production.imgix.net/uploads/2017/01/17103153/170115_logoprimario_rgb.png?fit=crop&crop=faces&q=80&auto=compress,format&w=364&h=700&dpr=2.625",
  },
  {
    name: "Bayern Munich",
    route: "bayern-munich",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/2048px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
  },
];

const products = [
  {
    name: "Real Madrid 23/24 Home Jersey",
    price: "2,500,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/1.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Real Madrid 23/24 Away Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/2.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Real Madrid 23/24 Third Jersey",
    price: "2,200,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/3.jpg",
    desc: "Men Football - New",
  },
  {
    name: "Real Madrid 23/24 Shorts",
    price: "1,000,000₫",
    image: "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/4.jpg",
    desc: "Men Football - New",
  },
];

export default function RealMadridPage() {
  const router = useRouter();
  const pathname = usePathname();
  const currentTeam = teams.findIndex((t) => pathname.endsWith(t.route));

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", px: { xs: 1, md: 4 }, py: 4 }}>
      <Stack direction="row" justifyContent="center" alignItems="center" mb={3} spacing={2}>
        <Tabs value={currentTeam} textColor="primary" indicatorColor="primary">
          {teams.map((team, idx) => (
            <Tab
              key={team.route}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={team.logo} alt={team.name} sx={{ width: 24, height: 24, bgcolor: '#fff', border: '1px solid #eee' }} />
                  <Typography fontWeight={700}>
                    {team.name}
                  </Typography>
                </Box>
              }
              onClick={() => router.push(`/en/men/${team.route}`)}
              sx={{
                fontWeight: currentTeam === idx ? 700 : 400,
                color: currentTeam === idx ? "#00529F" : "inherit",
                textTransform: "none",
                minWidth: 120,
              }}
            />
          ))}
        </Tabs>
      </Stack>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            px: 3,
            bgcolor: "#fff",
            borderColor: "#222",
            color: "#222",
            "&:hover": { bgcolor: "#f5f5f5", borderColor: "#111" },
          }}
          startIcon={<span style={{ fontSize: 18 }}>☰</span>}
        >
          FILTER & SORT
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
        {products.map((item, idx) => (
          <Box key={idx} sx={{ height: '100%' }}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="260"
                image={item.image}
                alt={item.name}
                sx={{ objectFit: "cover", bgcolor: "#f5f5f5" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography fontWeight={700} fontSize={18} mb={1}>
                  {item.price}
                </Typography>
                <Typography fontWeight={500}>{item.name}</Typography>
                <Typography fontSize={14} color="text.secondary">
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
} 