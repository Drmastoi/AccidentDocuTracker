import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PDFCustomizationOptions } from '@/lib/pdf-generator';
import { FileImage, FileText, Layout, List, Palette, Type } from 'lucide-react';

interface PDFOptionsPanelProps {
  options: PDFCustomizationOptions;
  onChange: (options: PDFCustomizationOptions) => void;
  onClose: () => void;
  onApply: () => void;
}

export function PDFOptionsPanel({ options, onChange, onClose, onApply }: PDFOptionsPanelProps) {
  const [currentTab, setCurrentTab] = useState('layout');

  const updateOptions = (partialOptions: Partial<PDFCustomizationOptions>) => {
    onChange({
      ...options,
      ...partialOptions
    });
  };

  const updateSectionsToInclude = (sectionName: keyof PDFCustomizationOptions['sectionsToInclude'], value: boolean) => {
    onChange({
      ...options,
      sectionsToInclude: {
        ...options.sectionsToInclude,
        [sectionName]: value
      }
    });
  };

  return (
    <Card className="w-full max-w-3xl border border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 p-4">
        <CardTitle className="text-lg font-semibold text-slate-800">PDF Report Customization</CardTitle>
        <CardDescription>Customize the PDF report layout, content, and styling</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>Sections</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Style</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Typography</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page-size">Page Size</Label>
                <Select 
                  value={options.pageSize}
                  onValueChange={(value) => updateOptions({ pageSize: value as 'a4' | 'letter' })}
                >
                  <SelectTrigger id="page-size">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation</Label>
                <Select 
                  value={options.orientation}
                  onValueChange={(value) => updateOptions({ orientation: value as 'portrait' | 'landscape' })}
                >
                  <SelectTrigger id="orientation">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeCoverPage}
                  onCheckedChange={(checked) => updateOptions({ includeCoverPage: checked })}
                  id="cover-page"
                />
                <Label htmlFor="cover-page">Include Cover Page</Label>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeTableOfContents}
                  onCheckedChange={(checked) => updateOptions({ includeTableOfContents: checked })}
                  id="toc"
                />
                <Label htmlFor="toc">Include Table of Contents</Label>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeFooterOnEveryPage}
                  onCheckedChange={(checked) => updateOptions({ includeFooterOnEveryPage: checked })}
                  id="footer"
                />
                <Label htmlFor="footer">Include Footer on Every Page</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeAgencyDetails}
                  onCheckedChange={(checked) => updateOptions({ includeAgencyDetails: checked })}
                  id="agency-details"
                />
                <Label htmlFor="agency-details">Include Agency & Solicitor Details</Label>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeExpertCV}
                  onCheckedChange={(checked) => updateOptions({ includeExpertCV: checked })}
                  id="expert-cv"
                />
                <Label htmlFor="expert-cv">Include Expert CV</Label>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeDeclaration}
                  onCheckedChange={(checked) => updateOptions({ includeDeclaration: checked })}
                  id="declaration"
                />
                <Label htmlFor="declaration">Include Declaration</Label>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={options.includeSectionNumbers}
                  onCheckedChange={(checked) => updateOptions({ includeSectionNumbers: checked })}
                  id="section-numbers"
                />
                <Label htmlFor="section-numbers">Include Section Numbers</Label>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL (optional)</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="logo-url" 
                  value={options.logoUrl || ''} 
                  onChange={(e) => updateOptions({ logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                <Button variant="outline" size="icon">
                  <FileImage className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.claimantDetails}
                    onCheckedChange={(checked) => updateSectionsToInclude('claimantDetails', !!checked)}
                    id="include-claimant"
                  />
                  <Label htmlFor="include-claimant">Claimant Details</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.accidentDetails}
                    onCheckedChange={(checked) => updateSectionsToInclude('accidentDetails', !!checked)}
                    id="include-accident"
                  />
                  <Label htmlFor="include-accident">Accident Details</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.physicalInjury}
                    onCheckedChange={(checked) => updateSectionsToInclude('physicalInjury', !!checked)}
                    id="include-physical"
                  />
                  <Label htmlFor="include-physical">Physical Injury</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.psychologicalInjury}
                    onCheckedChange={(checked) => updateSectionsToInclude('psychologicalInjury', !!checked)}
                    id="include-psychological"
                  />
                  <Label htmlFor="include-psychological">Psychological Injury</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.treatments}
                    onCheckedChange={(checked) => updateSectionsToInclude('treatments', !!checked)}
                    id="include-treatments"
                  />
                  <Label htmlFor="include-treatments">Treatments</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.lifeStyleImpact}
                    onCheckedChange={(checked) => updateSectionsToInclude('lifeStyleImpact', !!checked)}
                    id="include-lifestyle"
                  />
                  <Label htmlFor="include-lifestyle">Lifestyle Impact</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.familyHistory}
                    onCheckedChange={(checked) => updateSectionsToInclude('familyHistory', !!checked)}
                    id="include-family"
                  />
                  <Label htmlFor="include-family">Family History</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={options.sectionsToInclude?.expertDetails}
                    onCheckedChange={(checked) => updateSectionsToInclude('expertDetails', !!checked)}
                    id="include-expert"
                  />
                  <Label htmlFor="include-expert">Expert Details</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-10 h-10 rounded border border-slate-200" 
                  style={{ 
                    backgroundColor: `rgb(${options.primaryColor?.join(',')})` 
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={options.primaryColor?.[0] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 255) {
                        updateOptions({ 
                          primaryColor: [value, options.primaryColor?.[1] || 0, options.primaryColor?.[2] || 0] 
                        });
                      }
                    }}
                    placeholder="R"
                  />
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={options.primaryColor?.[1] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 255) {
                        updateOptions({ 
                          primaryColor: [options.primaryColor?.[0] || 0, value, options.primaryColor?.[2] || 0] 
                        });
                      }
                    }}
                    placeholder="G"
                  />
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={options.primaryColor?.[2] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 255) {
                        updateOptions({ 
                          primaryColor: [options.primaryColor?.[0] || 0, options.primaryColor?.[1] || 0, value] 
                        });
                      }
                    }}
                    placeholder="B"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-10 h-10 rounded border border-slate-200" 
                  style={{ 
                    backgroundColor: `rgb(${options.secondaryColor?.join(',')})` 
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={options.secondaryColor?.[0] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 255) {
                        updateOptions({ 
                          secondaryColor: [value, options.secondaryColor?.[1] || 0, options.secondaryColor?.[2] || 0] 
                        });
                      }
                    }}
                    placeholder="R"
                  />
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={options.secondaryColor?.[1] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 255) {
                        updateOptions({ 
                          secondaryColor: [options.secondaryColor?.[0] || 0, value, options.secondaryColor?.[2] || 0] 
                        });
                      }
                    }}
                    placeholder="G"
                  />
                  <Input 
                    type="number" 
                    min="0" 
                    max="255" 
                    value={options.secondaryColor?.[2] || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 255) {
                        updateOptions({ 
                          secondaryColor: [options.secondaryColor?.[0] || 0, options.secondaryColor?.[1] || 0, value] 
                        });
                      }
                    }}
                    placeholder="B"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select 
                value={options.fontFamily}
                onValueChange={(value) => updateOptions({ fontFamily: value as 'helvetica' | 'courier' | 'times' })}
              >
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                  <SelectItem value="times">Times</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title-size">Title Size</Label>
                <Input 
                  id="title-size" 
                  type="number" 
                  min="8" 
                  max="36" 
                  value={options.fontSize?.title || 18}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 8 && value <= 36) {
                      updateOptions({ 
                        fontSize: {
                          ...options.fontSize,
                          title: value
                        } 
                      });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle-size">Subtitle Size</Label>
                <Input 
                  id="subtitle-size" 
                  type="number" 
                  min="6" 
                  max="24" 
                  value={options.fontSize?.subtitle || 10}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 6 && value <= 24) {
                      updateOptions({ 
                        fontSize: {
                          ...options.fontSize,
                          subtitle: value
                        } 
                      });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heading-size">Section Header Size</Label>
                <Input 
                  id="heading-size" 
                  type="number" 
                  min="8" 
                  max="24" 
                  value={options.fontSize?.sectionHeader || 12}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 8 && value <= 24) {
                      updateOptions({ 
                        fontSize: {
                          ...options.fontSize,
                          sectionHeader: value
                        } 
                      });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-size">Body Text Size</Label>
                <Input 
                  id="body-size" 
                  type="number" 
                  min="6" 
                  max="18" 
                  value={options.fontSize?.bodyText || 9}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 6 && value <= 18) {
                      updateOptions({ 
                        fontSize: {
                          ...options.fontSize,
                          bodyText: value
                        } 
                      });
                    }
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <div className="flex justify-end gap-2 p-4 bg-slate-50 border-t border-slate-200">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onApply}>Apply Changes</Button>
      </div>
    </Card>
  );
}