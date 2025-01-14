import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Focus, FlaskConical} from 'lucide-react';
import {EntityCard, IconButton} from './entity_base';

interface LigandEntityProps {
    chemicalId: string;
    drugbank_id?: string;
    drugbank_description?: string;
    formula_weight?: number;
    pdbx_description?: string;
    onFocus: () => void;
}

export const LigandEntity: React.FC<LigandEntityProps> = ({
    chemicalId,
    drugbank_id,
    drugbank_description,
    formula_weight,
    pdbx_description,
    onFocus
}) => {
    return (
        <EntityCard
            icon={<FlaskConical size={16} />}
            title={
                <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">Ligand {chemicalId}</span>
                    {drugbank_id && (
                        <Link
                            href={`https://go.drugbank.com/drugs/${drugbank_id}`}
                            className="text-xs text-blue-500 hover:underline hover:text-blue-600 flex-shrink-0"
                            target="_blank">
                            DrugBank: {drugbank_id}
                        </Link>
                    )}
                </div>
            }
            controls={<IconButton icon={<Focus size={16} />} onClick={onFocus} title="Focus on ligand" />}>
            <div className="flex flex-col lg:flex-row gap-4 min-w-0">
                <div className="lg:w-1/3 w-full max-w-[200px]">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-white border border-gray-100">
                        <Image
                            src={`https://cdn.rcsb.org/images/ccd/labeled/${
                                chemicalId.toUpperCase()[0]
                            }/${chemicalId.toUpperCase()}.svg`}
                            alt={`${chemicalId} chemical structure`}
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                </div>

                <div className="lg:w-2/3 w-full min-w-0 space-y-3">
                    <div className="space-y-2">
                        {drugbank_description && (
                            <p className="text-sm text-gray-600 line-clamp-3">{drugbank_description}</p>
                        )}
                        {pdbx_description && !drugbank_description && (
                            <p className="text-sm text-gray-600">{pdbx_description}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {formula_weight && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-gray-500">Formula Weight:</span>
                                <span className="text-gray-900">{formula_weight.toFixed(2)} Da</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EntityCard>
    );
};
