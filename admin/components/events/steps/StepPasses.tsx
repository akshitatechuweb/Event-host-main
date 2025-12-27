import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface Pass {
  type: "Male" | "Female" | "Couple";
  price: number;
  totalQuantity: number;
}

export function StepPasses() {
  const [passes, setPasses] = useState<Pass[]>([
    { type: "Male", price: 1500, totalQuantity: 300 },
    { type: "Female", price: 1000, totalQuantity: 200 },
    { type: "Couple", price: 2200, totalQuantity: 50 },
  ]);

  const updatePass = (index: number, field: keyof Pass, value: any) => {
    const updated = [...passes];
    updated[index] = { ...updated[index], [field]: value };
    setPasses(updated);
  };

  const removePass = (index: number) => {
    setPasses(passes.filter((_, i) => i !== index));
  };

  const addPass = (type: "Male" | "Female" | "Couple") => {
    if (passes.some((p) => p.type === type)) return;
    setPasses([...passes, { type, price: 0, totalQuantity: 0 }]);
  };

  const availableTypes = (["Male", "Female", "Couple"] as const).filter(
    (type) => !passes.some((p) => p.type === type)
  );

  return (
    <div className="space-y-6">
      {/* Pass Cards */}
      <div className="space-y-4">
        {passes.map((pass, index) => (
          <div
            key={index}
            className="
              p-5 rounded-2xl
              bg-black/5 dark:bg-white/5
              border border-black/5 dark:border-white/10
              hover:border-violet-500/20 dark:hover:border-violet-500/30
              transition-all
            "
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${
                      pass.type === "Male"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : pass.type === "Female"
                        ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    }
                  `}
                >
                  {pass.type === "Male" ? "♂" : pass.type === "Female" ? "♀" : "♥"}
                </div>
                <h3 className="font-semibold text-black dark:text-white">
                  {pass.type} Pass
                </h3>
              </div>
              <button
                onClick={() => removePass(index)}
                className="
                  p-2 rounded-lg
                  text-red-500 hover:bg-red-500/10
                  transition-colors
                "
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-black/60 dark:text-white/60">
                  Price (₹)
                </Label>
                <Input
                  type="number"
                  value={pass.price}
                  onChange={(e) =>
                    updatePass(index, "price", Number(e.target.value))
                  }
                  className="
                    h-11 bg-white dark:bg-black/20
                    border-black/10 dark:border-white/10
                    focus:border-violet-500 dark:focus:border-violet-500
                  "
                  placeholder="1500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-black/60 dark:text-white/60">
                  Total Quantity
                </Label>
                <Input
                  type="number"
                  value={pass.totalQuantity}
                  onChange={(e) =>
                    updatePass(index, "totalQuantity", Number(e.target.value))
                  }
                  className="
                    h-11 bg-white dark:bg-black/20
                    border-black/10 dark:border-white/10
                    focus:border-violet-500 dark:focus:border-violet-500
                  "
                  placeholder="300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Pass Buttons */}
      {availableTypes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm text-black/60 dark:text-white/60">
            Add Pass Type
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => addPass(type)}
                className="
                  px-4 py-2 rounded-xl
                  bg-white dark:bg-white/5
                  border border-dashed border-black/20 dark:border-white/20
                  hover:border-violet-500 dark:hover:border-violet-500
                  hover:bg-violet-500/5
                  text-sm text-black/70 dark:text-white/70
                  transition-all
                "
              >
                + {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="pt-4 border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/60 dark:text-white/60">
            Total Pass Types
          </span>
          <span className="font-semibold text-black dark:text-white">
            {passes.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-black/60 dark:text-white/60">
            Total Capacity
          </span>
          <span className="font-semibold text-black dark:text-white">
            {passes.reduce((sum, p) => sum + p.totalQuantity, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}