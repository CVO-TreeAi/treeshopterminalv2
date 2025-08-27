"use client";

interface MobileDataCardProps<T> {
  item: T;
  primaryField: keyof T;
  secondaryField?: keyof T;
  statusField?: keyof T;
  valueField?: keyof T;
  onClick?: () => void;
  renderStatus?: (status: any) => React.ReactNode;
  renderActions?: () => React.ReactNode;
}

export default function MobileDataCard<T extends Record<string, any>>({
  item,
  primaryField,
  secondaryField,
  statusField,
  valueField,
  onClick,
  renderStatus,
  renderActions,
}: MobileDataCardProps<T>) {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${
        onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-white font-medium text-lg">
            {String(item[primaryField])}
          </h3>
          {secondaryField && (
            <p className="text-gray-400 text-sm mt-1">
              {String(item[secondaryField])}
            </p>
          )}
        </div>
        {statusField && (
          <div>
            {renderStatus ? renderStatus(item[statusField]) : (
              <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                {String(item[statusField])}
              </span>
            )}
          </div>
        )}
      </div>

      {valueField && (
        <div className="text-green-400 font-bold text-xl mb-3">
          {String(item[valueField])}
        </div>
      )}

      {/* Additional fields */}
      <div className="space-y-1 text-sm">
        {Object.entries(item)
          .filter(([key]) => 
            key !== primaryField && 
            key !== secondaryField && 
            key !== statusField && 
            key !== valueField &&
            !key.startsWith('_')
          )
          .slice(0, 3)
          .map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-gray-300">
                {typeof value === 'object' ? 'Complex' : String(value)}
              </span>
            </div>
          ))}
      </div>

      {renderActions && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          {renderActions()}
        </div>
      )}
    </div>
  );
}