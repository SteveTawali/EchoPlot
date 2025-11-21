import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, CheckCircle, AlertCircle, Brain, Leaf } from "lucide-react";
import { toast } from "sonner";
import { aiTreeRecognition } from "@/utils/aiImageRecognition";
import { useLanguage } from "@/hooks/useLanguage";
import { logger } from "@/utils/logger";

interface AIVerificationUploadProps {
  onVerificationComplete: (result: any) => void;
  expectedTree?: {
    id: string;
    name: string;
  };
  userLocation?: {
    county: string;
    agroZone: string;
  };
}

export const AIVerificationUpload = ({ 
  onVerificationComplete, 
  expectedTree,
  userLocation 
}: AIVerificationUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Tafadhali chagua faili la picha');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image file is too large (max 10MB)' : 'Faili la picha ni kubwa sana (kiwango cha juu 10MB)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start AI analysis
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Perform AI analysis
      const result = await aiTreeRecognition.analyzeTreePhoto(file, userLocation);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisResult(result);

      // Check if the identified species matches expected tree
      if (expectedTree && result.species.length > 0) {
        const topMatch = result.species[0];
        const isCorrectSpecies = topMatch.id === expectedTree.id || 
                                topMatch.name.toLowerCase().includes(expectedTree.name.toLowerCase());
        
        if (isCorrectSpecies) {
          toast.success(
            language === 'en' 
              ? `✅ AI confirmed: ${topMatch.name} (${Math.round(topMatch.confidence * 100)}% confidence)`
              : `✅ AI imethibitisha: ${topMatch.name} (imani ${Math.round(topMatch.confidence * 100)}%)`
          );
        } else {
          toast.warning(
            language === 'en'
              ? `⚠️ AI detected: ${topMatch.name} (Expected: ${expectedTree.name})`
              : `⚠️ AI imegundua: ${topMatch.name} (Inatarajiwa: ${expectedTree.name})`
          );
        }
      }

      // Check tree health
      if (result.healthAssessment.isHealthy) {
        toast.success(
          language === 'en' 
            ? '🌿 Tree appears healthy!'
            : '🌿 Mti unaonekana mzuri!'
        );
      } else {
        toast.warning(
          language === 'en'
            ? '⚠️ Tree health concerns detected'
            : '⚠️ Matatizo ya afya ya mti yamegunduliwa'
        );
      }

      // Check if properly planted
      if (result.locationValidation.isPlanted) {
        toast.success(
          language === 'en'
            ? '✅ Tree appears to be properly planted'
            : '✅ Mti unaonekana umepandwa vizuri'
        );
      } else {
        toast.warning(
          language === 'en'
            ? '⚠️ Tree may not be properly planted'
            : '⚠️ Mti huenda haujapandwa vizuri'
        );
      }

    } catch (error) {
      logger.error('AI analysis failed:', error);
      toast.error(
        language === 'en'
          ? 'Failed to analyze image. Please try again.'
          : 'Imeshindwa kuchambua picha. Tafadhali jaribu tena.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setAnalysisProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (analysisResult) {
      onVerificationComplete({
        image: uploadedImage,
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {language === 'en' ? 'AI-Powered Tree Verification' : 'Uthibitisho wa Miti wa AI'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Upload a photo of your planted tree for AI analysis and verification'
              : 'Pakia picha ya mti wako uliopandwa kwa ajili ya uchambuzi na uthibitisho wa AI'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedImage ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'Take or upload a clear photo of your planted tree'
                  : 'Piga au pakia picha ya wazi ya mti wako uliopandwa'
                }
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Choose Image' : 'Chagua Picha'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded tree"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Brain className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">
                        {language === 'en' ? 'AI Analyzing...' : 'AI Inachambua...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {language === 'en' ? 'Analyzing image...' : 'Inachambua picha...'}
                    </span>
                    <span>{Math.round(analysisProgress)}%</span>
                  </div>
                  <Progress value={analysisProgress} className="w-full" />
                </div>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <div className="space-y-4">
                  {/* Species Identification */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      {language === 'en' ? 'Species Identification' : 'Utambuzi wa Aina'}
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.species.map((species: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{species.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'en' ? 'Confidence' : 'Imani'}: {Math.round(species.confidence * 100)}%
                            </p>
                          </div>
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {index === 0 
                              ? (language === 'en' ? 'Top Match' : 'Kufanana Zaidi')
                              : `#${index + 1}`
                            }
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Health Assessment */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      {analysisResult.healthAssessment.isHealthy ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      {language === 'en' ? 'Health Assessment' : 'Tathmini ya Afya'}
                    </h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {analysisResult.healthAssessment.isHealthy
                          ? (language === 'en' ? 'Tree appears healthy' : 'Mti unaonekana mzuri')
                          : (language === 'en' ? 'Health concerns detected' : 'Matatizo ya afya yamegunduliwa')
                        }
                      </p>
                      {analysisResult.healthAssessment.issues.length > 0 && (
                        <ul className="mt-2 text-sm text-muted-foreground">
                          {analysisResult.healthAssessment.issues.map((issue: string, index: number) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Growth Stage */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">
                      {language === 'en' ? 'Growth Stage' : 'Hatua ya Ukuaji'}
                    </h4>
                    <Badge variant="outline">
                      {analysisResult.growthStage.stage}
                    </Badge>
                  </div>

                  {/* Location Validation */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      {analysisResult.locationValidation.isPlanted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      {language === 'en' ? 'Planting Validation' : 'Uthibitisho wa Kupanda'}
                    </h4>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {analysisResult.locationValidation.isPlanted
                          ? (language === 'en' ? 'Tree appears to be properly planted' : 'Mti unaonekana umepandwa vizuri')
                          : (language === 'en' ? 'Tree may not be properly planted' : 'Mti huenda haujapandwa vizuri')
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'en' ? 'Environment' : 'Mazingira'}: {analysisResult.locationValidation.environment}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handleRetake} variant="outline">
                      {language === 'en' ? 'Retake Photo' : 'Piga Picha Tena'}
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1">
                      {language === 'en' ? 'Submit Verification' : 'Wasilisha Uthibitisho'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {language === 'en' ? 'AI-Powered Features' : 'Vipengele vya AI'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">
                {language === 'en' ? 'Species Recognition' : 'Utambuzi wa Aina'}
              </p>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Identifies tree species with 85%+ accuracy'
                  : 'Inatambua aina za miti kwa usahihi wa 85%+'
                }
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {language === 'en' ? 'Health Analysis' : 'Uchambuzi wa Afya'}
              </p>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Detects diseases and health issues'
                  : 'Inagundua magonjwa na matatizo ya afya'
                }
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {language === 'en' ? 'Growth Stage' : 'Hatua ya Ukuaji'}
              </p>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Determines seedling, sapling, or mature'
                  : 'Inaamua mche, mti mdogo, au mkubwa'
                }
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {language === 'en' ? 'Planting Validation' : 'Uthibitisho wa Kupanda'}
              </p>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Verifies proper planting location'
                  : 'Inathibitisha mahali pa kupanda'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

