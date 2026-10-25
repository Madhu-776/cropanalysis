import React, { useState } from 'react';

const CropAnalysisApp = () => {
  const [activeTab, setActiveTab] = useState('soil');
  const [loading, setLoading] = useState(false);
  
  // Soil Analysis State
  const [soilData, setSoilData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    location: '',
    crop: ''
  });
  const [soilAnalysis, setSoilAnalysis] = useState(null);
  
  // Disease Detection State
  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseasePreview, setDiseasePreview] = useState(null);
  const [diseaseAnalysis, setDiseaseAnalysis] = useState(null);

  const crops = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 
    'Potato', 'Tomato', 'Onion', 'Soybean', 'Groundnut',
    'Chickpea', 'Mustard', 'Sunflower', 'Barley', 'Tea','mango','Garlic'
  ];

  // Gemini API Configuration
  const GEMINI_API_KEY = 'AIzaSyC1kv4FZwS8efYd2ZDBdAydygXUdsFDO0k';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const analyzeSoilAndCrop = async () => {
    if (!soilData.nitrogen || !soilData.phosphorus || !soilData.potassium || !soilData.location || !soilData.crop) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setSoilAnalysis(null);

    const prompt = `You are an expert agricultural scientist and soil analyst. Analyze the following data and provide a comprehensive report:

NPK Values:
- Nitrogen (N): ${soilData.nitrogen} kg/ha
- Phosphorus (P): ${soilData.phosphorus} kg/ha
- Potassium (K): ${soilData.potassium} kg/ha

Location: ${soilData.location}
Desired Crop: ${soilData.crop}

Please provide a detailed analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "suitability": "Highly Suitable/Moderately Suitable/Not Suitable",
  "suitabilityScore": <number 0-100>,
  "summary": "<2-3 sentence overview>",
  "npkAnalysis": {
    "nitrogen": {
      "status": "Optimal/Deficient/Excessive",
      "assessment": "<detailed assessment>"
    },
    "phosphorus": {
      "status": "Optimal/Deficient/Excessive",
      "assessment": "<detailed assessment>"
    },
    "potassium": {
      "status": "Optimal/Deficient/Excessive",
      "assessment": "<detailed assessment>"
    }
  },
  "soilHealthScore": <number 0-100>,
  "recommendations": [
    "<specific recommendation 1>",
    "<specific recommendation 2>",
    "<specific recommendation 3>"
  ],
  "fertilizers": [
    {
      "name": "<fertilizer name>",
      "quantity": "<amount>",
      "timing": "<when to apply>"
    }
  ],
  "expectedYield": "<yield estimate>",
  "riskFactors": ["<risk 1>", "<risk 2>"],
  "bestPractices": ["<practice 1>", "<practice 2>", "<practice 3>"]
}`;

    try {
    const response = await fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY
  },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const analysisText = data.candidates[0].content.parts[0].text;
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          setSoilAnalysis(analysis);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error('No analysis generated');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeDiseaseImage = async () => {
    if (!diseaseImage) {
      alert('Please upload an image');
      return;
    }

    setLoading(true);
    setDiseaseAnalysis(null);

    const reader = new FileReader();
    reader.readAsDataURL(diseaseImage);
    
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1];

      const prompt = `You are an expert plant pathologist. Analyze this crop leaf image for diseases, pests, or nutritional deficiencies.

Provide a detailed analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "diseaseDetected": true/false,
  "diseaseName": "<disease name or 'Healthy' if no disease>",
  "confidence": <number 0-100>,
  "severity": "Mild/Moderate/Severe/None",
  "summary": "<2-3 sentence overview>",
  "symptoms": ["<symptom 1>", "<symptom 2>", "<symptom 3>"],
  "causativeAgent": "<pathogen/pest/deficiency type>",
  "affectedCrop": "<likely crop type>",
  "treatment": {
    "immediate": ["<action 1>", "<action 2>"],
    "shortTerm": ["<action 1>", "<action 2>"],
    "longTerm": ["<action 1>", "<action 2>"]
  },
  "chemicalControl": [
    {
      "product": "<product name>",
      "dosage": "<amount>",
      "application": "<how to apply>"
    }
  ],
  "organicControl": [
    {
      "method": "<organic method>",
      "procedure": "<how to use>"
    }
  ],
  "preventiveMeasures": ["<measure 1>", "<measure 2>", "<measure 3>"],
  "spreadRisk": "High/Medium/Low",
  "economicImpact": "<potential impact on yield>"
}`;

      try {
      const response = await fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY
  },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: diseaseImage.type,
                    data: base64Image
                  }
                }
              ]
            }]
          })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const analysisText = data.candidates[0].content.parts[0].text;
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            setDiseaseAnalysis(analysis);
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error('No analysis generated');
        }
      } catch (error) {
        console.error('Disease analysis error:', error);
        alert('Failed to analyze disease. Please check your API key and try again.');
      } finally {
        setLoading(false);
      }
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDiseaseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiseasePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSuitabilityColor = (suitability) => {
    if (suitability?.includes('Highly')) return '#059669';
    if (suitability?.includes('Moderately')) return '#d97706';
    return '#dc2626';
  };

  const getStatusBgColor = (status) => {
    if (status === 'Optimal') return '#d1fae5';
    if (status === 'Deficient') return '#fef3c7';
    return '#fee2e2';
  };

  const getStatusTextColor = (status) => {
    if (status === 'Optimal') return '#065f46';
    if (status === 'Deficient') return '#92400e';
    return '#991b1b';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    h1: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      color: '#6b7280',
      margin: 0
    },
    tabContainer: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '24px',
      overflow: 'hidden'
    },
    tabButtons: {
      display: 'flex',
      borderBottom: '2px solid #e5e7eb'
    },
    tabButton: {
      flex: 1,
      padding: '16px 24px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '16px'
    },
    tabButtonActive: {
      background: '#059669',
      color: 'white'
    },
    tabButtonInactive: {
      background: '#f3f4f6',
      color: '#6b7280'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    h2: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '24px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '10px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      background: '#059669',
      color: 'white',
      padding: '14px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background 0.3s'
    },
    buttonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    uploadedImage: {
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      display: 'block',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    resultHeader: {
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '16px',
      marginBottom: '24px'
    },
    resultTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    h3: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    scoreContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px'
    },
    scoreBox: {
      flex: 1
    },
    scoreLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    progressBar: {
      height: '16px',
      background: '#e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '4px'
    },
    progressFill: {
      height: '100%',
      transition: 'width 0.5s'
    },
    scoreText: {
      textAlign: 'right',
      fontSize: '14px',
      fontWeight: '600'
    },
    summaryBox: {
      background: '#dbeafe',
      padding: '16px',
      borderRadius: '8px',
      color: '#1e40af'
    },
    h4: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '16px'
    },
    npkCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    },
    npkHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    npkTitle: {
      fontWeight: '600',
      color: '#1f2937',
      textTransform: 'capitalize'
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '600'
    },
    npkText: {
      fontSize: '14px',
      color: '#6b7280'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    listItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '8px',
      color: '#374151'
    },
    fertilizerCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      background: '#f0fdf4'
    },
    fertilizerTitle: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    fertilizerDetail: {
      fontSize: '14px',
      color: '#374151',
      marginBottom: '4px'
    },
    infoBox: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    },
    treatmentCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    },
    treatmentTitle: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    treatmentList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    treatmentItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '4px',
      fontSize: '14px',
      color: '#374151'
    },
    controlCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    },
    controlTitle: {
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    controlText: {
      fontSize: '14px',
      color: '#374151'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    statBox: {
      background: '#f9fafb',
      padding: '12px',
      borderRadius: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280'
    },
    statValue: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M7.5 12H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2.5"/>
            </svg>
            <h1 style={styles.h1}>Smart AgroTech:Soil and Crop Health Monitoring System</h1>
          </div>
          <p style={styles.subtitle}>AI-Powered Crop Suitability & Disease Detection</p>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <div style={styles.tabButtons}>
            <button
              onClick={() => setActiveTab('soil')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'soil' ? styles.tabButtonActive : styles.tabButtonInactive)
              }}
            >
              📊 Soil & Crop Analysis
            </button>
            <button
              onClick={() => setActiveTab('disease')}
              style={{
                ...styles.tabButton,
                ...(activeTab === 'disease' ? styles.tabButtonActive : styles.tabButtonInactive)
              }}
            >
              📷 Disease Detection
            </button>
          </div>
        </div>

        {/* Soil Analysis Tab */}
        {activeTab === 'soil' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.h2}>NPK Sensor Data & Crop Selection</h2>
              
              <div style={styles.grid3}>
                <div>
                  <label style={styles.label}>Nitrogen (N) - kg/ha</label>
                  <input
                    type="number"
                    value={soilData.nitrogen}
                    onChange={(e) => setSoilData({...soilData, nitrogen: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., 240"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Phosphorus (P) - kg/ha</label>
                  <input
                    type="number"
                    value={soilData.phosphorus}
                    onChange={(e) => setSoilData({...soilData, phosphorus: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., 50"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>Potassium (K) - kg/ha</label>
                  <input
                    type="number"
                    value={soilData.potassium}
                    onChange={(e) => setSoilData({...soilData, potassium: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., 200"
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>📍 Location</label>
                  <input
                    type="text"
                    value={soilData.location}
                    onChange={(e) => setSoilData({...soilData, location: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., Punjab, India"
                  />
                </div>
                
                <div>
                  <label style={styles.label}>🌾 Select Crop</label>
                  <select
                    value={soilData.crop}
                    onChange={(e) => setSoilData({...soilData, crop: e.target.value})}
                    style={styles.select}
                  >
                    <option value="">Choose a crop...</option>
                    {crops.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={analyzeSoilAndCrop}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.background = '#047857';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.background = '#059669';
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze Soil & Crop Suitability'}
              </button>
            </div>

            {/* Soil Analysis Results */}
            {soilAnalysis && (
              <div style={styles.card}>
                <div style={styles.resultHeader}>
                  <div style={styles.resultTitle}>
                    <h3 style={styles.h3}>Analysis Report</h3>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getSuitabilityColor(soilAnalysis.suitability)
                    }}>
                      {soilAnalysis.suitability}
                    </div>
                  </div>
                  
                  <div style={styles.scoreContainer}>
                    <div style={styles.scoreBox}>
                      <div style={styles.scoreLabel}>Suitability Score</div>
                      <div style={styles.progressBar}>
                        <div 
                          style={{
                            ...styles.progressFill,
                            width: `${soilAnalysis.suitabilityScore}%`,
                            background: soilAnalysis.suitabilityScore >= 70 ? '#059669' :
                                       soilAnalysis.suitabilityScore >= 40 ? '#d97706' : '#dc2626'
                          }}
                        />
                      </div>
                      <div style={styles.scoreText}>{soilAnalysis.suitabilityScore}/100</div>
                    </div>
                    
                    <div style={styles.scoreBox}>
                      <div style={styles.scoreLabel}>Soil Health Score</div>
                      <div style={styles.progressBar}>
                        <div 
                          style={{
                            ...styles.progressFill,
                            width: `${soilAnalysis.soilHealthScore}%`,
                            background: soilAnalysis.soilHealthScore >= 70 ? '#059669' :
                                       soilAnalysis.soilHealthScore >= 40 ? '#d97706' : '#dc2626'
                          }}
                        />
                      </div>
                      <div style={styles.scoreText}>{soilAnalysis.soilHealthScore}/100</div>
                    </div>
                  </div>
                  
                  <div style={styles.summaryBox}>{soilAnalysis.summary}</div>
                </div>

                <div style={{marginBottom: '24px'}}>
                  <h4 style={styles.h4}>NPK Analysis</h4>
                  <div style={styles.grid3}>
                    {Object.entries(soilAnalysis.npkAnalysis).map(([key, value]) => (
                      <div key={key} style={styles.npkCard}>
                        <div style={styles.npkHeader}>
                          <h5 style={styles.npkTitle}>{key}</h5>
                          <span style={{
                            ...styles.statusBadge,
                            background: getStatusBgColor(value.status),
                            color: getStatusTextColor(value.status)
                          }}>
                            {value.status}
                          </span>
                        </div>
                        <p style={styles.npkText}>{value.assessment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.grid2}>
                  <div>
                    <h4 style={styles.h4}>✅ Recommendations</h4>
                    <ul style={styles.list}>
                      {soilAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx} style={styles.listItem}>
                          <span style={{color: '#059669', fontWeight: 'bold'}}>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={styles.h4}>⚠️ Risk Factors</h4>
                    <ul style={styles.list}>
                      {soilAnalysis.riskFactors.map((risk, idx) => (
                        <li key={idx} style={styles.listItem}>
                          <span style={{color: '#ea580c', fontWeight: 'bold'}}>•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{marginTop: '24px'}}>
                  <h4 style={styles.h4}>Fertilizer Recommendations</h4>
                  <div style={styles.grid2}>
                    {soilAnalysis.fertilizers.map((fert, idx) => (
                      <div key={idx} style={styles.fertilizerCard}>
                        <h5 style={styles.fertilizerTitle}>{fert.name}</h5>
                        <div style={styles.fertilizerDetail}>
                          <strong>Quantity:</strong> {fert.quantity}
                        </div>
                        <div style={styles.fertilizerDetail}>
                          <strong>Timing:</strong> {fert.timing}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{...styles.grid2, marginTop: '24px'}}>
                  <div style={{...styles.infoBox, background: '#dbeafe'}}>
                    <h4 style={{...styles.h4, marginBottom: '8px'}}>Expected Yield</h4>
                    <p style={{color: '#1e40af', margin: 0}}>{soilAnalysis.expectedYield}</p>
                  </div>

                  <div>
                    <h4 style={styles.h4}>Best Practices</h4>
                    <ul style={styles.list}>
                      {soilAnalysis.bestPractices.map((practice, idx) => (
                        <li key={idx} style={styles.listItem}>
                          <span style={{color: '#2563eb'}}>✓</span>
                          <span style={{fontSize: '14px'}}>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disease Detection Tab */}
        {activeTab === 'disease' && (
          <div>
            <div style={styles.card}>
              <h2 style={styles.h2}>Disease Detection from Leaf Image</h2>
              
              <div style={{marginBottom: '24px'}}>
                <label style={styles.label}>Upload Crop Leaf Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={styles.input}
                />
              </div>

              {diseasePreview && (
                <div style={{marginBottom: '24px'}}>
                  <img 
                    src={diseasePreview} 
                    alt="Uploaded leaf" 
                    style={styles.uploadedImage}
                  />
                </div>
              )}

              <button
                onClick={analyzeDiseaseImage}
                disabled={loading || !diseaseImage}
                style={{
                  ...styles.button,
                  ...(loading || !diseaseImage ? styles.buttonDisabled : {})
                }}
                onMouseOver={(e) => {
                  if (!loading && diseaseImage) e.target.style.background = '#047857';
                }}
                onMouseOut={(e) => {
                  if (!loading && diseaseImage) e.target.style.background = '#059669';
                }}
              >
                {loading ? 'Analyzing Disease...' : 'Analyze Leaf for Diseases'}
              </button>
            </div>

            {/* Disease Analysis Results */}
            {diseaseAnalysis && (
              <div style={styles.card}>
                <div style={styles.resultHeader}>
                  <div style={styles.resultTitle}>
                    <h3 style={styles.h3}>Disease Analysis Report</h3>
                    <div>
                      {diseaseAnalysis.diseaseDetected ? (
                        <span style={{fontSize: '32px'}}>❌</span>
                      ) : (
                        <span style={{fontSize: '32px'}}>✅</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                      <div style={styles.statLabel}>Disease</div>
                      <div style={styles.statValue}>{diseaseAnalysis.diseaseName}</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statLabel}>Confidence</div>
                      <div style={styles.statValue}>{diseaseAnalysis.confidence}%</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statLabel}>Severity</div>
                      <div style={{
                        ...styles.statValue,
                        color: diseaseAnalysis.severity === 'Severe' ? '#dc2626' :
                               diseaseAnalysis.severity === 'Moderate' ? '#ea580c' :
                               diseaseAnalysis.severity === 'Mild' ? '#d97706' : '#059669'
                      }}>{diseaseAnalysis.severity}</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statLabel}>Spread Risk</div>
                      <div style={{
                        ...styles.statValue,
                        color: diseaseAnalysis.spreadRisk === 'High' ? '#dc2626' :
                               diseaseAnalysis.spreadRisk === 'Medium' ? '#ea580c' : '#059669'
                      }}>{diseaseAnalysis.spreadRisk}</div>
                    </div>
                  </div>
                  
                  <div style={styles.summaryBox}>{diseaseAnalysis.summary}</div>
                </div>

                <div style={styles.grid2}>
                  <div>
                    <h4 style={styles.h4}>Symptoms Identified</h4>
                    <ul style={styles.list}>
                      {diseaseAnalysis.symptoms.map((symptom, idx) => (
                        <li key={idx} style={styles.listItem}>
                          <span style={{color: '#dc2626', fontWeight: 'bold'}}>•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div style={{...styles.infoBox, background: '#fef3c7', marginBottom: '16px'}}>
                      <h5 style={{...styles.fertilizerTitle, margin: '0 0 4px 0'}}>Causative Agent</h5>
                      <p style={{color: '#78350f', margin: 0}}>{diseaseAnalysis.causativeAgent}</p>
                    </div>
                    <div style={{...styles.infoBox, background: '#fed7aa'}}>
                      <h5 style={{...styles.fertilizerTitle, margin: '0 0 4px 0'}}>Economic Impact</h5>
                      <p style={{color: '#7c2d12', margin: 0}}>{diseaseAnalysis.economicImpact}</p>
                    </div>
                  </div>
                </div>

                <div style={{marginTop: '24px'}}>
                  <h4 style={styles.h4}>Treatment Plan</h4>
                  <div style={styles.grid3}>
                    <div style={{...styles.treatmentCard, background: '#fee2e2'}}>
                      <h5 style={styles.treatmentTitle}>Immediate Actions</h5>
                      <ul style={styles.treatmentList}>
                        {diseaseAnalysis.treatment.immediate.map((action, idx) => (
                          <li key={idx} style={styles.treatmentItem}>
                            <span style={{color: '#dc2626'}}>→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{...styles.treatmentCard, background: '#fed7aa'}}>
                      <h5 style={styles.treatmentTitle}>Short-term (1-2 weeks)</h5>
                      <ul style={styles.treatmentList}>
                        {diseaseAnalysis.treatment.shortTerm.map((action, idx) => (
                          <li key={idx} style={styles.treatmentItem}>
                            <span style={{color: '#ea580c'}}>→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{...styles.treatmentCard, background: '#d1fae5'}}>
                      <h5 style={styles.treatmentTitle}>Long-term Prevention</h5>
                      <ul style={styles.treatmentList}>
                        {diseaseAnalysis.treatment.longTerm.map((action, idx) => (
                          <li key={idx} style={styles.treatmentItem}>
                            <span style={{color: '#059669'}}>→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{...styles.grid2, marginTop: '24px'}}>
                  <div>
                    <h4 style={styles.h4}>Chemical Control</h4>
                    <div>
                      {diseaseAnalysis.chemicalControl.map((chem, idx) => (
                        <div key={idx} style={{...styles.controlCard, background: '#e9d5ff'}}>
                          <h5 style={styles.controlTitle}>{chem.product}</h5>
                          <div style={styles.controlText}>
                            <div style={{marginBottom: '4px'}}><strong>Dosage:</strong> {chem.dosage}</div>
                            <div><strong>Application:</strong> {chem.application}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={styles.h4}>Organic Control</h4>
                    <div>
                      {diseaseAnalysis.organicControl.map((org, idx) => (
                        <div key={idx} style={{...styles.controlCard, background: '#d1fae5'}}>
                          <h5 style={styles.controlTitle}>{org.method}</h5>
                          <p style={{...styles.controlText, margin: 0}}>{org.procedure}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{marginTop: '24px'}}>
                  <h4 style={styles.h4}>🛡️ Preventive Measures</h4>
                  <div style={styles.grid3}>
                    {diseaseAnalysis.preventiveMeasures.map((measure, idx) => (
                      <div key={idx} style={{...styles.infoBox, background: '#f0f9ff'}}>
                        <div style={{display: 'flex', alignItems: 'flex-start', gap: '8px'}}>
                          <span style={{color: '#0284c7', fontSize: '18px', fontWeight: 'bold'}}>✓</span>
                          <p style={{color: '#075985', margin: 0, fontSize: '14px'}}>{measure}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropAnalysisApp;