'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
} from '@mui/material';
import { Close, Info } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  productType: 'shoes' | 'clothing' | 'pants';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ShoesData {
  size: string;
  length: string;
  width: string;
  description: string;
}

interface ClothingData {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  description: string;
}

interface PantsData {
  size: string;
  waist: string;
  length: string;
  hip: string;
  description: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`size-guide-tabpanel-${index}`}
      aria-labelledby={`size-guide-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ open, onClose, productType }) => {
  const t = useTranslations('productDetail');
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSizeGuideData = () => {
    switch (productType) {
      case 'shoes':
        return {
          title: 'Hướng Dẫn Chọn Size Giày',
          description: 'Đo chân của bạn để chọn size giày phù hợp nhất',
          tabs: [
            {
              label: 'Nam',
              data: [
                { size: '39', length: '25.5cm', width: '9.5cm', description: 'Chân nhỏ' },
                { size: '40', length: '26cm', width: '9.8cm', description: 'Chân nhỏ' },
                { size: '41', length: '26.5cm', width: '10cm', description: 'Chân trung bình' },
                { size: '42', length: '27cm', width: '10.2cm', description: 'Chân trung bình' },
                { size: '43', length: '27.5cm', width: '10.5cm', description: 'Chân lớn' },
                { size: '44', length: '28cm', width: '10.8cm', description: 'Chân lớn' },
                { size: '45', length: '28.5cm', width: '11cm', description: 'Chân rất lớn' },
              ]
            },
            {
              label: 'Nữ',
              data: [
                { size: '36', length: '23.5cm', width: '8.5cm', description: 'Chân nhỏ' },
                { size: '37', length: '24cm', width: '8.8cm', description: 'Chân nhỏ' },
                { size: '38', length: '24.5cm', width: '9cm', description: 'Chân trung bình' },
                { size: '39', length: '25cm', width: '9.2cm', description: 'Chân trung bình' },
                { size: '40', length: '25.5cm', width: '9.5cm', description: 'Chân lớn' },
                { size: '41', length: '26cm', width: '9.8cm', description: 'Chân lớn' },
              ]
            },
            {
              label: 'Trẻ Em',
              data: [
                { size: '28', length: '18cm', width: '6.5cm', description: '2-3 tuổi' },
                { size: '30', length: '19cm', width: '7cm', description: '4-5 tuổi' },
                { size: '32', length: '20cm', width: '7.5cm', description: '6-7 tuổi' },
                { size: '34', length: '21cm', width: '8cm', description: '8-9 tuổi' },
                { size: '36', length: '22cm', width: '8.5cm', description: '10-11 tuổi' },
              ]
            }
          ]
        };
      
      case 'clothing':
        return {
          title: 'Hướng Dẫn Chọn Size Áo',
          description: 'Đo vòng ngực và chiều cao để chọn size áo phù hợp',
          tabs: [
            {
              label: 'Nam',
              data: [
                { size: 'S', chest: '96-100cm', length: '68cm', shoulder: '44cm', description: 'Người gầy' },
                { size: 'M', chest: '100-104cm', length: '70cm', shoulder: '46cm', description: 'Người trung bình' },
                { size: 'L', chest: '104-108cm', length: '72cm', shoulder: '48cm', description: 'Người trung bình' },
                { size: 'XL', chest: '108-112cm', length: '74cm', shoulder: '50cm', description: 'Người to' },
                { size: 'XXL', chest: '112-116cm', length: '76cm', shoulder: '52cm', description: 'Người rất to' },
              ]
            },
            {
              label: 'Nữ',
              data: [
                { size: 'XS', chest: '80-84cm', length: '60cm', shoulder: '36cm', description: 'Người gầy' },
                { size: 'S', chest: '84-88cm', length: '62cm', shoulder: '38cm', description: 'Người gầy' },
                { size: 'M', chest: '88-92cm', length: '64cm', shoulder: '40cm', description: 'Người trung bình' },
                { size: 'L', chest: '92-96cm', length: '66cm', shoulder: '42cm', description: 'Người trung bình' },
                { size: 'XL', chest: '96-100cm', length: '68cm', shoulder: '44cm', description: 'Người to' },
              ]
            },
            {
              label: 'Trẻ Em',
              data: [
                { size: '4-5Y', chest: '56-60cm', length: '42cm', shoulder: '28cm', description: '4-5 tuổi' },
                { size: '6-7Y', chest: '60-64cm', length: '44cm', shoulder: '30cm', description: '6-7 tuổi' },
                { size: '8-9Y', chest: '64-68cm', length: '46cm', shoulder: '32cm', description: '8-9 tuổi' },
                { size: '10-11Y', chest: '68-72cm', length: '48cm', shoulder: '34cm', description: '10-11 tuổi' },
              ]
            }
          ]
        };
      
      case 'pants':
        return {
          title: 'Hướng Dẫn Chọn Size Quần',
          description: 'Đo vòng eo và chiều dài chân để chọn size quần phù hợp',
          tabs: [
            {
              label: 'Nam',
              data: [
                { size: '28', waist: '71-76cm', length: '32inch', hip: '91-96cm', description: 'Người gầy' },
                { size: '30', waist: '76-81cm', length: '32inch', hip: '96-101cm', description: 'Người gầy' },
                { size: '32', waist: '81-86cm', length: '32inch', hip: '101-106cm', description: 'Người trung bình' },
                { size: '34', waist: '86-91cm', length: '32inch', hip: '106-111cm', description: 'Người trung bình' },
                { size: '36', waist: '91-96cm', length: '32inch', hip: '111-116cm', description: 'Người to' },
                { size: '38', waist: '96-101cm', length: '32inch', hip: '116-121cm', description: 'Người to' },
              ]
            },
            {
              label: 'Nữ',
              data: [
                { size: 'XS', waist: '66-71cm', length: '30inch', hip: '86-91cm', description: 'Người gầy' },
                { size: 'S', waist: '71-76cm', length: '30inch', hip: '91-96cm', description: 'Người gầy' },
                { size: 'M', waist: '76-81cm', length: '30inch', hip: '96-101cm', description: 'Người trung bình' },
                { size: 'L', waist: '81-86cm', length: '30inch', hip: '101-106cm', description: 'Người trung bình' },
                { size: 'XL', waist: '86-91cm', length: '30inch', hip: '106-111cm', description: 'Người to' },
              ]
            },
            {
              label: 'Trẻ Em',
              data: [
                { size: '4-5Y', waist: '51-56cm', length: '24inch', hip: '61-66cm', description: '4-5 tuổi' },
                { size: '6-7Y', waist: '56-61cm', length: '26inch', hip: '66-71cm', description: '6-7 tuổi' },
                { size: '8-9Y', waist: '61-66cm', length: '28inch', hip: '71-76cm', description: '8-9 tuổi' },
                { size: '10-11Y', waist: '66-71cm', length: '30inch', hip: '76-81cm', description: '10-11 tuổi' },
              ]
            }
          ]
        };
      
      default:
        return {
          title: 'Hướng Dẫn Chọn Size',
          description: 'Chọn size phù hợp với cơ thể của bạn',
          tabs: []
        };
    }
  };

  const sizeGuideData = getSizeGuideData();

  const renderShoesTable = (data: ShoesData[]) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chiều Dài</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chiều Rộng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mô Tả</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.size} hover>
              <TableCell sx={{ fontWeight: 'bold' }}>{row.size}</TableCell>
              <TableCell>{row.length}</TableCell>
              <TableCell>{row.width}</TableCell>
              <TableCell>
                <Chip label={row.description} size="small" color="primary" variant="outlined" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderClothingTable = (data: ClothingData[]) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vòng Ngực</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chiều Dài</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vai</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mô Tả</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.size} hover>
              <TableCell sx={{ fontWeight: 'bold' }}>{row.size}</TableCell>
              <TableCell>{row.chest}</TableCell>
              <TableCell>{row.length}</TableCell>
              <TableCell>{row.shoulder}</TableCell>
              <TableCell>
                <Chip label={row.description} size="small" color="primary" variant="outlined" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderPantsTable = (data: PantsData[]) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vòng Eo</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chiều Dài</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vòng Mông</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mô Tả</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.size} hover>
              <TableCell sx={{ fontWeight: 'bold' }}>{row.size}</TableCell>
              <TableCell>{row.waist}</TableCell>
              <TableCell>{row.length}</TableCell>
              <TableCell>{row.hip}</TableCell>
              <TableCell>
                <Chip label={row.description} size="small" color="primary" variant="outlined" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTable = (data: ShoesData[] | ClothingData[] | PantsData[]) => {
    switch (productType) {
      case 'shoes':
        return renderShoesTable(data as ShoesData[]);
      case 'clothing':
        return renderClothingTable(data as ClothingData[]);
      case 'pants':
        return renderPantsTable(data as PantsData[]);
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        pb: 2
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {sizeGuideData.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {sizeGuideData.description}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {sizeGuideData.tabs.length > 0 && (
          <>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 3,
                pt: 2
              }}
            >
              {sizeGuideData.tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>

            {sizeGuideData.tabs.map((tab, index) => (
              <TabPanel key={index} value={tabValue} index={index}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Size Guide - {tab.label}
                  </Typography>
                  {renderTable(tab.data)}
                  
                  {/* Hướng dẫn đo */}
                  <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                      <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Hướng Dẫn Đo
                    </Typography>
                    {productType === 'shoes' && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Cách đo chân:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            1. Đặt chân lên tờ giấy trắng
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            2. Vẽ viền chân bằng bút chì
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            3. Đo từ gót đến ngón chân dài nhất
                          </Typography>
                          <Typography variant="body2">
                            4. Đối chiếu với bảng size trên
                          </Typography>
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Lưu ý:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Đo vào buổi chiều khi chân to nhất
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Mang tất khi đo nếu định mặc tất
                          </Typography>
                          <Typography variant="body2">
                            • Nên chọn size lớn hơn 0.5cm so với chân thật
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {productType === 'clothing' && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Cách đo áo:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            1. Vòng ngực: Đo vòng quanh ngực tại điểm to nhất
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            2. Chiều dài: Đo từ vai đến độ dài mong muốn
                          </Typography>
                          <Typography variant="body2">
                            3. Vai: Đo từ vai trái đến vai phải
                          </Typography>
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Lưu ý:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Đo khi mặc áo mỏng
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Không đo quá chặt hoặc quá lỏng
                          </Typography>
                          <Typography variant="body2">
                            • Nên chọn size lớn hơn nếu thích mặc rộng
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {productType === 'pants' && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Cách đo quần:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            1. Vòng eo: Đo vòng quanh eo tại điểm nhỏ nhất
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            2. Vòng mông: Đo vòng quanh mông tại điểm to nhất
                          </Typography>
                          <Typography variant="body2">
                            3. Chiều dài: Đo từ eo đến độ dài mong muốn
                          </Typography>
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Lưu ý:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Đo khi mặc quần mỏng
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            • Không đo quá chặt hoặc quá lỏng
                          </Typography>
                          <Typography variant="body2">
                            • Nên chọn size lớn hơn nếu thích mặc rộng
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </TabPanel>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ 
            bgcolor: '#000',
            '&:hover': { bgcolor: '#333' },
            borderRadius: 2,
            px: 3
          }}
        >
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SizeGuideModal; 