import React, { useContext } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DownloadIcon, EyeIcon, InfoIcon } from 'lucide-react';
import { MolstarContext } from "@/components/mstar/molstar_context"
import ReactJson from 'react-json-view';
import { useParams } from 'next/navigation';
import { NonpolymericLigand } from '@/store/ribxz_api/ribxz_api';
import { Landmark } from '@/app/landmarks/types';
import { Button } from 'molstar/lib/mol-plugin-ui/controls/common';
interface StructuralComponentProps {
  title           : string;
  description     : string;
  extendedContent : React.ReactNode;
  imageUrl?        : string;
  annotation     ?: string;
  actions         : React.ReactNode;
}

const StructuralComponent:React.FC<StructuralComponentProps> = ({
  title,
  description,
  extendedContent,
  imageUrl,
  annotation,
  actions
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={title} className="border rounded-md overflow-hidden">
        <AccordionTrigger className="hover:no-underline py-2 px-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 text-left">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-xs text-gray-500 italic">{description}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {annotation && <span className="text-xs text-green-500">{annotation}</span>}
              {actions}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-2">
          {extendedContent}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const LandmarkItem:React.FC<Landmark > = ({ 
  landmark_actions,
  title,
  description    ,
  longDescription,
  imageUrl       ,
  rcsb_id
}) => {
  const ctx = useContext(MolstarContext);
  const actions = (
    <>
      {landmark_actions.download && (<DownloadIcon className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" onClick={(e) => { e.stopPropagation(); landmark_actions.download!(rcsb_id); }} />)}
      {landmark_actions.render && (<EyeIcon className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" onClick={(e) => { e.stopPropagation(); landmark_actions.render!(rcsb_id, ctx!); }} />)}
            <Button onClick={()=>{ landmark_actions.on_click!() }}>Select</Button>
      <Popover>
        <PopoverTrigger asChild>
          <InfoIcon className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
        </PopoverTrigger>
        <PopoverContent className="w-80" >
          <div className="flex flex-col space-y-2">
            <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded" />
            <p className="text-sm text-gray-700">{longDescription}</p>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );

  const extendedContent = (
    <p className="text-sm text-gray-700">{longDescription}</p>
  );

  return (
    <StructuralComponent
    annotation={""}
      title={title}
      description={description}
      extendedContent={extendedContent}
      imageUrl={imageUrl}
      actions={actions}
    />
  );
};

const LigandItem = ({ title, description, ligandData }: { title: string, description: string, ligandData: NonpolymericLigand }) => {
  const ctx = useContext(MolstarContext);
  const { rcsb_id } = useParams();

  const actions = (
    <>
      {/* <DownloadIcon className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" onClick={(e) => { e.stopPropagation(); ctx?.renderLigand(rcsb_id, title); }} /> */}
      <EyeIcon
        className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700 "

        onClick={(e) => {
          e.stopPropagation();
          ctx?.create_ligand_and_surroundings(ligandData.chemicalId, 5)
          ctx?.select_focus_ligand(ligandData.chemicalId, ['select', 'focus']);
        }}
      />
    </>
  );

  const extendedContent = (
    <div className="max-h-96 overflow-auto bg-white">
      <ReactJson
        src={ligandData}
        theme="chalk"
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        collapsed={2}
      />
    </div>
  );

  return (
    <StructuralComponent
      title={title}
      description={description}
      extendedContent={extendedContent}
      // annotation      = "LIGAND"
      actions={actions}
    />
  );
};

export { StructuralComponent, LandmarkItem, LigandItem }