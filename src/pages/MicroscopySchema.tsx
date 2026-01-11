import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface NodeData {
  id: string;
  type: 'source' | 'condenser' | 'specimen' | 'objective' | 'eyepiece' | 'result' | 'method';
  label: string;
  icon: string;
  value?: any;
  x: number;
  y: number;
  outputs?: string[];
  inputs?: string[];
}

interface Connection {
  from: string;
  to: string;
  active: boolean;
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
      { name: 'Ядро клетки', size: 5000, emoji: '⚪', color: 'bg-blue-500' },
      { name: 'Митохондрии', size: 1000, emoji: '🔵', color: 'bg-purple-500' },
      { name: 'Хлоропласт', size: 5000, emoji: '🟢', color: 'bg-green-500' },
      { name: 'Бактерии', size: 500, emoji: '🦠', color: 'bg-yellow-500' },
      { name: 'Аппарат Гольджи', size: 1000, emoji: '🟣', color: 'bg-indigo-500' },
      { name: 'Рибосомы', size: 25, emoji: '🔴', color: 'bg-red-500' },
      { name: 'Вирусы', size: 100, emoji: '🔺', color: 'bg-orange-500' }
    ];

    return structures.filter(s => s.size >= resolution);
  };

  const nodes: NodeData[] = [
    { id: 'light', type: 'source', label: 'Источник света', icon: 'Lightbulb', x: 100, y: 300, outputs: ['condenser'] },
    { id: 'condenser', type: 'condenser', label: 'Конденсор', icon: 'Cone', x: 280, y: 300, inputs: ['light'], outputs: ['specimen'] },
    { id: 'specimen', type: 'specimen', label: 'Образец', icon: 'Droplet', x: 460, y: 300, inputs: ['condenser'], outputs: ['objective'] },
    { id: 'objective', type: 'objective', label: 'Объектив', icon: 'Circle', x: 640, y: 300, inputs: ['specimen'], outputs: ['method'] },
    { id: 'method', type: 'method', label: 'Метод', icon: 'Sparkles', x: 820, y: 300, inputs: ['objective'], outputs: ['eyepiece'] },
    { id: 'eyepiece', type: 'eyepiece', label: 'Окуляр', icon: 'Eye', x: 1000, y: 300, inputs: ['method'], outputs: ['result'] },
    { id: 'result', type: 'result', label: 'Результат', icon: 'Target', x: 1180, y: 300, inputs: ['eyepiece'] }
  ];

  const connections: Connection[] = [
    { from: 'light', to: 'condenser', active: true },
    { from: 'condenser', to: 'specimen', active: condenser.na > 0.5 },
    { from: 'specimen', to: 'objective', active: true },
    { from: 'objective', to: 'method', active: objective.na > 0.3 },
    { from: 'method', to: 'eyepiece', active: true },
    { from: 'eyepiece', to: 'result', active: true }
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

  const renderNodeContent = (node: NodeData) => {
    switch (node.id) {
      case 'light':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Длина волны</span>
              <Badge variant="secondary">{lightSource.wavelength} нм</Badge>
            </div>
            <Slider
              value={[lightSource.wavelength]}
              onValueChange={(v) => setLightSource({ ...lightSource, wavelength: v[0] })}
              min={400}
              max={700}
              step={10}
              className="w-full"
            />
            <div className="h-4 rounded" style={{ background: getLightColor() }} />
          </div>
        );

      case 'condenser':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">NA конденсора</span>
              <Badge variant="secondary">{condenser.na}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.5, 0.9, 1.25].map((na) => (
                <Button
                  key={na}
                  size="sm"
                  variant={condenser.na === na ? 'default' : 'outline'}
                  onClick={() => setCondenser({ ...condenser, na })}
                  className="text-xs"
                >
                  {na}
                </Button>
              ))}
            </div>
            <div className="text-xs text-slate-500">
              {condenser.na >= 0.9 ? '✓ Освещение оптимально' : '⚠ Низкое разрешение'}
            </div>
          </div>
        );

      case 'specimen':
        return (
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Разрешение</div>
            <div className="text-2xl font-bold text-purple-400">{calculateResolution().toFixed(0)} нм</div>
            <div className="text-xs text-slate-500">
              {calculateResolution() < 300 ? '🔬 Высокое' : calculateResolution() < 600 ? '👁 Среднее' : '⚠ Низкое'}
            </div>
          </div>
        );

      case 'objective':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Увеличение</span>
              <Badge variant="secondary">{objective.magnification}x</Badge>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[10, 40, 60, 100].map((mag) => (
                <Button
                  key={mag}
                  size="sm"
                  variant={objective.magnification === mag ? 'default' : 'outline'}
                  onClick={() => {
                    const naMap: Record<number, number> = { 10: 0.25, 40: 0.65, 60: 0.85, 100: 1.4 };
                    setObjective({
                      magnification: mag,
                      na: naMap[mag],
                      immersion: mag === 100
                    });
                  }}
                  className="text-xs p-1"
                >
                  {mag}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">NA: {objective.na}</span>
              <Badge variant={objective.immersion ? 'default' : 'outline'} className="text-xs">
                {objective.immersion ? '🔬 Масло' : '💨 Воздух'}
              </Badge>
            </div>
          </div>
        );

      case 'method':
        return (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 mb-2">Метод наблюдения</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'brightfield', name: 'Светлое', icon: 'Sun' },
                { id: 'darkfield', name: 'Тёмное', icon: 'Moon' },
                { id: 'phase', name: 'Фазовый', icon: 'Waves' },
                { id: 'fluorescence', name: 'Флюор', icon: 'Zap' }
              ].map((m) => (
                <Button
                  key={m.id}
                  size="sm"
                  variant={method === m.id ? 'default' : 'outline'}
                  onClick={() => setMethod(m.id as any)}
                  className="text-xs"
                >
                  <Icon name={m.icon as any} size={12} className="mr-1" />
                  {m.name}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'eyepiece':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Окуляр</span>
              <Badge variant="secondary">10x</Badge>
            </div>
            <div className="text-xl font-bold text-blue-400">
              Итого: {objective.magnification * 10}x
            </div>
          </div>
        );

      case 'result':
        const visible = getVisibleStructures();
        return (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <div className="text-xs text-slate-400 sticky top-0 bg-slate-800 pb-2">
              Видимые структуры ({visible.length})
            </div>
            <div className="space-y-2">
              {visible.map((s) => (
                <div
                  key={s.name}
                  className={`${s.color} bg-opacity-20 border border-current rounded p-2 animate-scale-in`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.size} нм</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {showMobileWarning && window.innerWidth < 1024 && (
        <div className="fixed top-4 left-4 right-4 bg-purple-600/90 backdrop-blur-sm p-4 rounded-lg shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="RotateCw" size={24} />
              <p className="text-sm">Поверните устройство горизонтально для полного просмотра схемы</p>
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

      <div className="p-4 md:p-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Оптический путь микроскопа
          </h1>
          <p className="text-slate-300 text-sm md:text-lg">
            Node-based схема: измените параметры и увидьте результат
          </p>
        </div>

        <div className="relative min-h-[600px] bg-slate-900/30 rounded-xl border border-slate-700 p-8 overflow-x-auto">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ minWidth: '1400px', minHeight: '600px' }}
          >
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getLightColor()} stopOpacity="0.8" />
                <stop offset="100%" stopColor={getLightColor()} stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map((conn, idx) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 140;
              const y1 = fromNode.y + 60;
              const x2 = toNode.x;
              const y2 = toNode.y + 60;

              return (
                <g key={idx}>
                  <path
                    d={`M ${x1} ${y1} L ${x2} ${y2}`}
                    stroke={conn.active ? 'url(#connectionGradient)' : '#334155'}
                    strokeWidth={conn.active ? '3' : '2'}
                    strokeDasharray={conn.active ? '0' : '5,5'}
                    filter={conn.active ? 'url(#glow)' : 'none'}
                    className={conn.active ? 'animate-pulse' : ''}
                    style={{ animationDuration: '3s' }}
                  />
                  {conn.active && (
                    <circle
                      cx={x1 + (x2 - x1) * 0.5}
                      cy={y1 + (y2 - y1) * 0.5}
                      r="4"
                      fill={getLightColor()}
                      className="animate-pulse"
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          <div className="relative" style={{ minWidth: '1400px', minHeight: '600px' }}>
            {nodes.map((node) => (
              <Card
                key={node.id}
                className={`absolute transition-all duration-300 cursor-pointer
                  ${
                    selectedNode === node.id
                      ? 'bg-slate-800 border-purple-500 shadow-2xl shadow-purple-500/50 scale-105'
                      : 'bg-slate-800/80 border-slate-600 hover:border-purple-400'
                  }
                  backdrop-blur-sm`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: '140px',
                  minHeight: '120px'
                }}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: getLightColor(), opacity: 0.8 }}
                    >
                      <Icon name={node.icon as any} size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{node.label}</div>
                    </div>
                  </div>

                  {selectedNode === node.id && (
                    <div className="animate-scale-in mt-3 border-t border-slate-700 pt-3">
                      {renderNodeContent(node)}
                    </div>
                  )}
                </div>

                {node.outputs && node.outputs.length > 0 && (
                  <div
                    className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-slate-900"
                    style={{ background: getLightColor() }}
                  />
                )}

                {node.inputs && node.inputs.length > 0 && (
                  <div
                    className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-slate-900"
                    style={{ background: getLightColor() }}
                  />
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Icon name="Microscope" size={20} className="text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Разрешение</div>
                <div className="text-2xl font-bold text-purple-400">{calculateResolution().toFixed(0)} нм</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {calculateResolution() < 300
                ? '🔬 Отличное разрешение — видны мелкие структуры'
                : calculateResolution() < 600
                ? '👁 Среднее разрешение — видны основные органеллы'
                : '⚠ Низкое разрешение — видны только крупные объекты'}
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Icon name="Zap" size={20} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Увеличение</div>
                <div className="text-2xl font-bold text-blue-400">{objective.magnification * 10}x</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Объектив {objective.magnification}x × Окуляр 10x
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-green-500/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Icon name="Eye" size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Видимые объекты</div>
                <div className="text-2xl font-bold text-green-400">{getVisibleStructures().length}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {method === 'fluorescence'
                ? '✨ Флюоресценция — максимум структур'
                : method === 'darkfield'
                ? '🌙 Тёмное поле — контрастные объекты'
                : '☀️ Классическое наблюдение'}
            </p>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/50">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-semibold text-purple-300">
                💡 Совет: {objective.magnification === 100 && objective.immersion
                  ? 'Отличная конфигурация! Попробуйте флюоресценцию для наблюдения вирусов'
                  : objective.magnification < 60
                  ? 'Увеличьте объектив до 100x и включите иммерсию для максимального разрешения'
                  : 'Попробуйте иммерсионный объектив 100x для наблюдения бактерий и вирусов'}
              </p>
              <p className="text-xs text-slate-400">
                Кликайте на ноды, чтобы изменить параметры и увидеть, как меняется результат
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
