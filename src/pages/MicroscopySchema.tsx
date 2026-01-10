import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface OpticalConfig {
  objectiveMagnification: number;
  objectiveNA: number;
  condenserNA: number;
  immersion: boolean;
  lightWavelength: number;
  method: 'brightfield' | 'darkfield' | 'phase' | 'fluorescence';
}

interface Organelle {
  name: string;
  nameRu: string;
  size: number;
  visible: boolean;
  type: 'animal' | 'plant' | 'bacteria' | 'virus';
}

export default function MicroscopySchema() {
  const [config, setConfig] = useState<OpticalConfig>({
    objectiveMagnification: 40,
    objectiveNA: 0.65,
    condenserNA: 0.9,
    immersion: false,
    lightWavelength: 550,
    method: 'brightfield'
  });

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showMobileWarning, setShowMobileWarning] = useState(true);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const calculateResolution = (): number => {
    const lambda = config.lightWavelength;
    const na = config.objectiveNA;
    return (0.61 * lambda) / na;
  };

  const getVisibleOrganelles = (): Organelle[] => {
    const resolution = calculateResolution();
    const organelles: Organelle[] = [
      { name: 'Nucleus', nameRu: 'Ядро', size: 5000, visible: true, type: 'animal' },
      { name: 'Mitochondria', nameRu: 'Митохондрии', size: 1000, visible: true, type: 'animal' },
      { name: 'Chloroplast', nameRu: 'Хлоропласт', size: 5000, visible: true, type: 'plant' },
      { name: 'Bacteria', nameRu: 'Бактерии', size: 500, visible: true, type: 'bacteria' },
      { name: 'Golgi apparatus', nameRu: 'Аппарат Гольджи', size: 1000, visible: resolution < 1000, type: 'animal' },
      { name: 'Endoplasmic reticulum', nameRu: 'ЭПР', size: 800, visible: resolution < 900, type: 'animal' },
      { name: 'Ribosomes', nameRu: 'Рибосомы', size: 25, visible: resolution < 50 && config.method === 'fluorescence', type: 'animal' },
      { name: 'Viruses', nameRu: 'Вирусы', size: 100, visible: resolution < 150 && config.method === 'fluorescence', type: 'virus' }
    ];

    return organelles;
  };

  const methods = [
    { id: 'brightfield', name: 'Светлое поле', icon: 'Sun', color: 'bg-yellow-500' },
    { id: 'darkfield', name: 'Тёмное поле', icon: 'Moon', color: 'bg-blue-500' },
    { id: 'phase', name: 'Фазовый контраст', icon: 'Waves', color: 'bg-purple-500' },
    { id: 'fluorescence', name: 'Флюоресценция', icon: 'Zap', color: 'bg-green-500' }
  ];

  const getLightColor = () => {
    const wl = config.lightWavelength;
    if (wl < 450) return '#8B5CF6'; // violet
    if (wl < 495) return '#0EA5E9'; // blue
    if (wl < 570) return '#10B981'; // green
    if (wl < 590) return '#F59E0B'; // yellow
    if (wl < 620) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const visibleOrganelles = getVisibleOrganelles();
  const resolution = calculateResolution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      {showMobileWarning && window.innerWidth < 768 && (
        <div className="fixed top-4 left-4 right-4 bg-purple-600/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="RotateCw" size={24} />
              <p className="text-sm">Поверните устройство горизонтально для лучшего просмотра</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileWarning(false)}
              className="text-white hover:bg-purple-700"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Оптический путь микроскопа
          </h1>
          <p className="text-slate-300 text-lg">Интерактивная схема: от света до видимых структур</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border-purple-500/30 p-6">
            <div className="relative">
              <svg
                viewBox="0 0 800 600"
                className="w-full h-auto"
                style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))' }}
              >
                <defs>
                  <linearGradient id="lightBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={getLightColor()} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={getLightColor()} stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                  <circle cx="400" cy="550" r="30" fill={getLightColor()} opacity="0.6" filter="url(#glow)" />
                  <text x="400" y="558" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    Источник
                  </text>
                </g>

                <path
                  d="M 380 520 L 380 480"
                  stroke="url(#lightBeam)"
                  strokeWidth="40"
                  className="animate-fade-in"
                  style={{ animationDuration: '2s', animationDelay: '0.5s' }}
                />

                <g
                  onClick={() => toggleNode('condenser')}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <rect x="340" y="450" width="120" height="30" fill="#4C1D95" rx="5" filter="url(#glow)" />
                  <text x="400" y="470" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    Конденсор
                  </text>
                  {expandedNodes.has('condenser') && (
                    <g className="animate-scale-in">
                      <rect x="480" y="440" width="200" height="80" fill="#1e293b" rx="8" stroke="#8B5CF6" strokeWidth="2" />
                      <text x="490" y="465" fill="#93C5FD" fontSize="12">
                        NA: {config.condenserNA}
                      </text>
                      <text x="490" y="485" fill="#93C5FD" fontSize="12">
                        Освещение: Кёлера
                      </text>
                      <text x="490" y="505" fill="#93C5FD" fontSize="12">
                        Диафрагма: открыта
                      </text>
                    </g>
                  )}
                </g>

                <path
                  d="M 390 450 L 395 380 M 410 450 L 405 380"
                  stroke="url(#lightBeam)"
                  strokeWidth="15"
                  className="animate-fade-in"
                  style={{ animationDuration: '2s', animationDelay: '1s' }}
                />

                <g>
                  <rect x="360" y="360" width="80" height="15" fill="#059669" rx="3" />
                  <text x="400" y="390" textAnchor="middle" fill="#10B981" fontSize="12">
                    Объект
                  </text>
                  <text x="400" y="405" textAnchor="middle" fill="#6EE7B7" fontSize="10">
                    {resolution.toFixed(0)} нм
                  </text>
                </g>

                <path
                  d="M 390 360 L 385 290 M 410 360 L 415 290"
                  stroke="url(#lightBeam)"
                  strokeWidth="15"
                  className="animate-fade-in"
                  style={{ animationDuration: '2s', animationDelay: '1.5s' }}
                />

                <g
                  onClick={() => toggleNode('objective')}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <ellipse cx="400" cy="260" rx="60" ry="30" fill="#7E22CE" filter="url(#glow)" />
                  <text x="400" y="268" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    Объектив {config.objectiveMagnification}x
                  </text>
                  {expandedNodes.has('objective') && (
                    <g className="animate-scale-in">
                      <rect x="480" y="230" width="220" height="100" fill="#1e293b" rx="8" stroke="#8B5CF6" strokeWidth="2" />
                      <text x="490" y="255" fill="#93C5FD" fontSize="12">
                        Увеличение: {config.objectiveMagnification}x
                      </text>
                      <text x="490" y="275" fill="#93C5FD" fontSize="12">
                        NA: {config.objectiveNA}
                      </text>
                      <text x="490" y="295" fill="#93C5FD" fontSize="12">
                        Иммерсия: {config.immersion ? 'Да (масло)' : 'Нет (воздух)'}
                      </text>
                      <text x="490" y="315" fill="#93C5FD" fontSize="12">
                        Разрешение: {resolution.toFixed(0)} нм
                      </text>
                    </g>
                  )}
                </g>

                <path
                  d="M 395 230 L 398 160"
                  stroke="url(#lightBeam)"
                  strokeWidth="10"
                  className="animate-fade-in"
                  style={{ animationDuration: '2s', animationDelay: '2s' }}
                />

                <g
                  onClick={() => toggleNode('eyepiece')}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <ellipse cx="400" cy="120" rx="50" ry="40" fill="#0891B2" filter="url(#glow)" />
                  <text x="400" y="128" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    Окуляр 10x
                  </text>
                  {expandedNodes.has('eyepiece') && (
                    <g className="animate-scale-in">
                      <rect x="100" y="90" width="200" height="80" fill="#1e293b" rx="8" stroke="#8B5CF6" strokeWidth="2" />
                      <text x="110" y="115" fill="#93C5FD" fontSize="12">
                        Увеличение: 10x
                      </text>
                      <text x="110" y="135" fill="#93C5FD" fontSize="12">
                        Поле зрения: 20 мм
                      </text>
                      <text x="110" y="155" fill="#93C5FD" fontSize="12">
                        Диоптрийная коррекция
                      </text>
                    </g>
                  )}
                </g>

                <path
                  d="M 400 80 L 400 40"
                  stroke={getLightColor()}
                  strokeWidth="6"
                  className="animate-fade-in"
                  style={{ animationDuration: '2s', animationDelay: '2.5s' }}
                />

                <g className="animate-scale-in" style={{ animationDelay: '3s' }}>
                  <circle cx="400" cy="20" r="15" fill="#EC4899" filter="url(#glow)" />
                  <text x="400" y="26" textAnchor="middle" fill="white" fontSize="12">
                    👁
                  </text>
                </g>
              </svg>
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30 p-6 space-y-4">
            <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
              <Icon name="Settings" size={24} />
              Конфигурация
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Объектив</label>
                <div className="flex gap-2">
                  {[10, 40, 60, 100].map((mag) => (
                    <Button
                      key={mag}
                      size="sm"
                      variant={config.objectiveMagnification === mag ? 'default' : 'outline'}
                      onClick={() => {
                        setConfig({
                          ...config,
                          objectiveMagnification: mag,
                          objectiveNA: mag === 100 ? 1.4 : mag === 60 ? 0.85 : mag === 40 ? 0.65 : 0.25
                        });
                      }}
                      className="flex-1"
                    >
                      {mag}x
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 flex items-center justify-between">
                  <span>Иммерсия</span>
                  <Badge variant={config.immersion ? 'default' : 'secondary'}>
                    {config.immersion ? 'Вкл' : 'Выкл'}
                  </Badge>
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const newImmersion = !config.immersion;
                    setConfig({
                      ...config,
                      immersion: newImmersion,
                      objectiveNA: newImmersion ? 1.4 : 0.65
                    });
                  }}
                >
                  {config.immersion ? 'Отключить' : 'Включить'} масло
                </Button>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Длина волны: {config.lightWavelength} нм
                </label>
                <input
                  type="range"
                  min="400"
                  max="700"
                  value={config.lightWavelength}
                  onChange={(e) => setConfig({ ...config, lightWavelength: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                  style={{
                    background: `linear-gradient(to right, 
                      #8B5CF6 0%, 
                      #0EA5E9 20%, 
                      #10B981 40%, 
                      #F59E0B 60%, 
                      #F97316 80%, 
                      #EF4444 100%)`
                  }}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">Метод наблюдения</label>
                <div className="space-y-2">
                  {methods.map((method) => (
                    <Button
                      key={method.id}
                      size="sm"
                      variant={config.method === method.id ? 'default' : 'outline'}
                      onClick={() => setConfig({ ...config, method: method.id as any })}
                      className="w-full justify-start"
                    >
                      <Icon name={method.icon as any} size={16} className="mr-2" />
                      {method.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400 space-y-1">
                  <p>
                    <span className="text-purple-300">Разрешение:</span> {resolution.toFixed(0)} нм
                  </p>
                  <p>
                    <span className="text-purple-300">Увеличение:</span> {config.objectiveMagnification * 10}x
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30 p-6">
          <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2 mb-4">
            <Icon name="Eye" size={24} />
            Видимые структуры
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleOrganelles.map((org) => (
              <div
                key={org.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  org.visible
                    ? 'bg-green-900/30 border-green-500 animate-scale-in'
                    : 'bg-slate-900/30 border-slate-600 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm">{org.nameRu}</h4>
                  {org.visible ? (
                    <Icon name="CheckCircle2" size={18} className="text-green-400" />
                  ) : (
                    <Icon name="XCircle" size={18} className="text-slate-500" />
                  )}
                </div>
                <p className="text-xs text-slate-400">{org.name}</p>
                <p className="text-xs text-purple-300 mt-1">{org.size} нм</p>
                <Badge
                  variant="outline"
                  className="mt-2 text-xs"
                  style={{
                    borderColor:
                      org.type === 'animal'
                        ? '#0EA5E9'
                        : org.type === 'plant'
                        ? '#10B981'
                        : org.type === 'bacteria'
                        ? '#F59E0B'
                        : '#EC4899'
                  }}
                >
                  {org.type === 'animal'
                    ? 'Животная'
                    : org.type === 'plant'
                    ? 'Растительная'
                    : org.type === 'bacteria'
                    ? 'Бактерия'
                    : 'Вирус'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/50">
            <p className="text-sm text-slate-300">
              <Icon name="Info" size={16} className="inline mr-2" />
              <strong>Совет:</strong>{' '}
              {config.objectiveMagnification < 100
                ? 'Попробуйте объектив 100x с иммерсией для максимального разрешения'
                : config.method === 'brightfield'
                ? 'Переключитесь на флюоресценцию для наблюдения вирусов и рибосом'
                : 'Отличная конфигурация! Видны даже мельчайшие структуры'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
