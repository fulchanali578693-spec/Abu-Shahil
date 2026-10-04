import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { StoreConfig } from '../config/storeConfig';

interface ProductSpecsProps {
  config: StoreConfig;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ config }) => {
  return (
    <section id="specifications" className="py-16 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Header column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Technical Data</span>
            </div>
            <h2 className="text-3xl font-serif-display font-bold text-stone-900 tracking-tight">
              Artisanal & Ultrasonic Specifications
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every detail is engineered with precision — from the acoustic frequency of the piezoelectric transducer to the porosity of the fired porcelain dome.
            </p>
            <div className="pt-4">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 space-y-2">
                <span className="font-bold text-stone-900 block">Package Contents:</span>
                <ul className="space-y-1 list-disc list-inside text-stone-600">
                  <li>1× AuraPulse Ceramic Diffuser Dome</li>
                  <li>1× 280ml Ultrasonic Base Reservoir</li>
                  <li>1× 2-meter Braided USB-C Power Cable</li>
                  <li>1× Universal 100-240V Wall Adapter</li>
                  <li>1× Quick Start & Care Guidebook</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Table column with tabular numbers */}
          <div className="lg:col-span-8">
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
                    <th className="py-3.5 px-5 w-1/3">Parameter</th>
                    <th className="py-3.5 px-5">Standard Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-normal">
                  {config.product.specifications.map((spec, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}
                    >
                      <td className="py-3.5 px-5 font-semibold text-stone-800">
                        {spec.label}
                      </td>
                      <td className="py-3.5 px-5 text-stone-600 tabular-nums">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
