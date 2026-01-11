import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface NodeData {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  outputs?: number;
  inputs?: number;
}

export default function MicroscopySchema() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  
  const [lightSource, setLightSource] = useState({
    wavelength: 550,
    intensity: 100
  });

  const [condenser, setCondenser] = useState({
    na: 0.9,
    diaphragm: 80
  });

  const [objective, setObjective] = useState({
    magnification: 40,
    na: 0.65,
    immersion: false
  });

  const [method, setMethod] = useState<'brightfield' | 'darkfield' | 'phase' | 'fluorescence'>('brightfield');

  const calculateResolution = (): number => {
    const lambda = lightSource.wavelength;
    const na = objective.na;
    const methodFactor = method === 'fluorescence' ? 0.5 : 1;
    return (0.61 * lambda * methodFactor) / na;
  };

  const getVisibleStructures = () => {
    const resolution = calculateResolution();
    const structures = [
      { name: 'Ядро клетки', size: 5000, emoji: '⚪' },
      { name: 'Митохондрии', size: 1000, emoji: '🔵' },
      { name: 'Хлоропласт', size: 5000, emoji: '🟢' },
      { name: 'Бактерии', size: 500, emoji: '🦠' },
      { name: 'Аппарат Гольджи', size: 1000, emoji: '🟣' },
      { name: 'Рибосомы', size: 25, emoji: '🔴' },
      { name: 'Вирусы', size: 100, emoji: '🔺' }
    ];

    return structures.filter(s => s.size >= resolution);
  };

  const nodes: NodeData[] = [
    { id: 'light', label: 'Источник света', subtitle: `${lightSource.wavelength} нм`, icon: 'Lightbulb', color: '#F59E0B', x: 150, y: 200, outputs: 1 },
    { id: 'condenser', label: 'Конденсор', subtitle: `NA ${condenser.na}`, icon: 'Cone', color: '#0EA5E9', x: 400, y: 200, inputs: 1, outputs: 1 },
    { id: 'specimen', label: 'Образец', subtitle: `${calculateResolution().toFixed(0)} нм`, icon: 'Droplet', color: '#10B981', x: 650, y: 200, inputs: 1, outputs: 1 },
    { id: 'objective', label: 'Объектив', subtitle: `${objective.magnification}x / NA ${objective.na}`, icon: 'Focus', color: '#8B5CF6', x: 900, y: 200, inputs: 1, outputs: 1 },
    { id: 'method', label: `${method === 'brightfield' ? 'Светлое поле' : method === 'darkfield' ? 'Тёмное поле' : method === 'phase' ? 'Фазовый контраст' : 'Флюоресценция'}`, subtitle: 'Метод наблюдения', icon: 'Sparkles', color: '#EC4899', x: 650, y: 450, inputs: 1, outputs: 1 },
    { id: 'eyepiece', label: 'Окуляр', subtitle: `Итого ${objective.magnification * 10}x`, icon: 'Eye', color: '#06B6D4', x: 900, y: 450, inputs: 1, outputs: 1 },
    { id: 'result', label: 'Результат наблюдения', subtitle: `${getVisibleStructures().length} структур`, icon: 'Target', color: '#22C55E', x: 1150, y: 350, inputs: 1 }
  ];

  const connections = [
    { from: nodes[0], to: nodes[1] },
    { from: nodes[1], to: nodes[2] },
    { from: nodes[2], to: nodes[3] },
    { from: nodes[3], to: nodes[4] },
    { from: nodes[4], to: nodes[5] },
    { from: nodes[5], to: nodes[6] }
  ];

  const getLightColor = () => {
    const wl = lightSource.wavelength;
    if (wl < 450) return '#8B5CF6';
    if (wl < 495) return '#0EA5E9';
    if (wl < 570) return '#10B981';
    if (wl < 590) return '#F59E0B';
    if (wl < 620) return '#F97316';
    return '#EF4444';
  };

  const getNodeColor = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.color || '#8B5CF6';
  };

  const renderModal = () => {
    if (!selectedNode) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedNode(null)}>
        <div className="bg-slate-800 rounded-2xl border-2 border-purple-500 shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {nodes.find(n => n.id === selectedNode)?.label}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            {selectedNode === 'light' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Длина волны света</label>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="text-lg">{lightSource.wavelength} нм</Badge>
                    <div className="w-8 h-8 rounded-full" style={{ background: getLightColor() }} />
                  </div>
                  <Slider
                    value={[lightSource.wavelength]}
                    onValueChange={(v) => setLightSource({ ...lightSource, wavelength: v[0] })}
                    min={400}
                    max={700}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Фиолетовый (400)</span>
                    <span>Красный (700)</span>
                  </div>
                </div>
              </>
            )}

            {selectedNode === 'condenser' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">Числовая апертура (NA) конденсора</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[0.5, 0.9, 1.25].map((na) => (
                      <Button
                        key={na}
                        variant={condenser.na === na ? 'default' : 'outline'}
                        onClick={() => setCondenser({ ...condenser, na })}
                        className="text-base font-semibold"
                      >
                        {na}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    {condenser.na >= 0.9 ? '✓ Оптимальное освещение для высокого разрешения' : '⚠ Низкая NA — ограниченное разрешение'}
                  </p>
                </div>
              </>
            )}

            {selectedNode === 'objective' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">Увеличение объектива</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 40, 60, 100].map((mag) => (
                      <Button
                        key={mag}
                        variant={objective.magnification === mag ? 'default' : 'outline'}
                        onClick={() => {
                          const naMap: Record<number, number> = { 10: 0.25, 40: 0.65, 60: 0.85, 100: 1.4 };
                          setObjective({
                            magnification: mag,
                            na: naMap[mag],
                            immersion: mag === 100
                          });
                        }}
                        className="text-base font-semibold"
                      >
                        {mag}x
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-sm text-slate-400">Числовая апертура (NA)</span>
                  <Badge variant="secondary" className="text-base">{objective.na}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-sm text-slate-400">Иммерсия</span>
                  <Badge variant={objective.immersion ? 'default' : 'outline'}>
                    {objective.immersion ? '🔬 Масляная' : '💨 Воздушная'}
                  </Badge>
                </div>
              </>
            )}

            {selectedNode === 'method' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-3 block">Метод микроскопии</label>
                  <div className="space-y-2">
                    {[
                      { id: 'brightfield', name: 'Светлое поле', icon: 'Sun', desc: 'Стандартное наблюдение' },
                      { id: 'darkfield', name: 'Тёмное поле', icon: 'Moon', desc: 'Контрастные объекты' },
                      { id: 'phase', name: 'Фазовый контраст', icon: 'Waves', desc: 'Прозрачные структуры' },
                      { id: 'fluorescence', name: 'Флюоресценция', icon: 'Zap', desc: 'Максимальное разрешение' }
                    ].map((m) => (
                      <Button
                        key={m.id}
                        variant={method === m.id ? 'default' : 'outline'}
                        onClick={() => setMethod(m.id as any)}
                        className="w-full justify-start h-auto py-3"
                      >
                        <Icon name={m.icon as any} size={20} className="mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-xs opacity-70">{m.desc}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedNode === 'result' && (
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {getVisibleStructures().map((s) => (
                    <div key={s.name} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{s.name}</div>
                        <div className="text-xs text-slate-400">Размер: {s.size} нм</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {showMobileWarning && window.innerWidth < 1280 && (
        <div className="fixed top-4 left-4 right-4 bg-purple-600/90 backdrop-blur-sm p-4 rounded-xl shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="RotateCw" size={24} />
              <p className="text-sm font-medium">Поверните устройство горизонтально для просмотра схемы</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowMobileWarning(false)} className="text-white">
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Оптический путь микроскопа
          </h1>
          <p className="text-slate-400 text-lg">Кликайте на ноды для изменения параметров</p>
        </div>

        <div className="relative bg-slate-900/20 rounded-2xl border border-slate-800 p-12 overflow-x-auto min-h-[700px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '1400px', minHeight: '700px' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map((conn, idx) => {
              const x1 = conn.from.x + 60;
              const y1 = conn.from.y + 60;
              const x2 = conn.to.x + 60;
              const y2 = conn.to.y + 60;

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  
                  <circle cx={midX} cy={midY} r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x={midX} y={midY + 1} textAnchor="middle" fill="#94a3b8" fontSize="16" fontFamily="monospace">⚙</text>
                </g>
              );
            })}
          </svg>

          <div className="relative" style={{ minWidth: '1400px', minHeight: '700px' }}>
            {nodes.map((node, idx) => (
              <div
                key={node.id}
                className="absolute cursor-pointer group transition-all duration-300 hover:scale-105"
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex flex-col items-center">
                  <div className="text-center mb-3 transition-all duration-300">
                    <div className="font-bold text-white text-sm mb-1 drop-shadow-lg">{node.label}</div>
                    <div className="text-xs text-slate-400">{node.subtitle}</div>
                    <Badge className="mt-1 text-xs font-mono">{idx + 1}</Badge>
                  </div>

                  <div
                    className="relative w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
                    style={{
                      background: node.color,
                      boxShadow: `0 10px 40px ${node.color}40`
                    }}
                  >
                    <Icon name={node.icon as any} size={48} className="text-white drop-shadow-lg" />

                    {node.inputs !== undefined && (
                      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 border-2 rounded-full" style={{ borderColor: node.color }} />
                    )}

                    {node.outputs !== undefined && (
                      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 border-2 rounded-full" style={{ borderColor: node.color }}>
                        <div className="absolute inset-0.5 rounded-full animate-pulse" style={{ background: node.color }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/30 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Icon name="Microscope" size={24} className="text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Разрешение</div>
              <div className="text-2xl font-bold text-purple-400">{calculateResolution().toFixed(0)} нм</div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Увеличение</div>
              <div className="text-2xl font-bold text-blue-400">{objective.magnification * 10}x</div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-green-500/30 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="Eye" size={24} className="text-green-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Видимые структуры</div>
              <div className="text-2xl font-bold text-green-400">{getVisibleStructures().length} шт</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/40">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={22} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-purple-300 mb-1">
                💡 {objective.magnification === 100 && objective.immersion
                  ? 'Максимальная конфигурация! Попробуйте флюоресценцию для наблюдения вирусов'
                  : objective.magnification < 60
                  ? 'Увеличьте объектив до 100x с иммерсией для максимального разрешения'
                  : 'Хорошая конфигурация! Переключите на 100x для наблюдения бактерий'}
              </p>
              <p className="text-xs text-slate-400">
                Каждая нода управляет параметрами оптического пути. Изменения мгновенно влияют на итоговое разрешение и видимые структуры.
              </p>
            </div>
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
}
