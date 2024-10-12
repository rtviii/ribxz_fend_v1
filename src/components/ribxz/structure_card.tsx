"use client"
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover"
import { CardContent, CardFooter, Card } from "@/components/ui/card"
import { RibosomeStructure } from "@/store/ribxz_api/ribxz_api"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import Link from "next/link"
import Image from 'next/image'
import { useAppSelector } from "@/store/store"
import { contract_taxname } from "@/my_utils"
import { ExpMethodBadge } from "./exp_method_badge"
import { useState } from "react"

export function StructureCard({ _ }: { _: RibosomeStructure }) {
  const RCSB_IDs = [
    "1FFK.png", "4D61.png", "4V75.png", "5IT8.png", "6BZ8.png", "6P4H.png", "6Z6M.png", "7OHQ.png", "7UCJ.png", "8EWB.png",
    "1FJG.png", "4D67.png", "4V76.png", "5IT9.png", "6C0F.png", "6P5I.png", "6Z6N.png", "7OHS.png", "7UCK.png", "8EWC.png",
    "1FKA.png", "4DR1.png", "4V77.png", "5J30.png", "6C4I.png", "6P5J.png", "6ZCE.png", "7OHT.png", "7UG6.png", "8EYQ.png",
    "1HNW.png", "4DR2.png", "4V78.png", "5J3C.png", "6C5L.png", "6P5N.png", "6ZJ3.png", "7OHU.png", "7UG7.png", "8EYT.png",
    "1HNX.png", "4DR4.png", "4V79.png", "5J4B.png", "6CAE.png", "6PJ6.png", "6ZM5.png", "7OHV.png", "7UNR.png", "8FC1.png",
    "1HNZ.png", "4DR5.png", "4V7A.png", "5J4C.png", "6CAO.png", "6PPF.png", "6ZQA.png", "7OHW.png", "7UNU.png", "8FC2.png",
    "1HR0.png", "4DR6.png", "4V7B.png", "5J4D.png", "6CAP.png", "6PPK.png", "6ZQB.png", "7OHX.png", "7UNV.png", "8FC3.png",
    "1I94.png", "4DR7.png", "4V7E.png", "5J5B.png", "6CAQ.png", "6PVK.png", "6ZQC.png", "7OHY.png", "7UNW.png", "8FC4.png",
    "1I95.png", "4DUZ.png", "4V7F.png", "5J7L.png", "6CAR.png", "6Q95.png", "6ZQD.png", "7OI6.png", "7UOO.png", "8FC5.png",
    "1I96.png", "4DV0.png", "4V7H.png", "5J88.png", "6CAS.png", "6Q97.png", "6ZQE.png", "7OI7.png", "7UPH.png", "8FC6.png",
    "1I97.png", "4DV1.png", "4V7I.png", "5J8A.png", "6CB1.png", "6Q98.png", "6ZQF.png", "7OI8.png", "7UQB.png", "8FKP.png",
    "1IBK.png", "4DV2.png", "4V7J.png", "5J8B.png", "6CFJ.png", "6Q9A.png", "6ZQG.png", "7OI9.png", "7UQZ.png", "8FKQ.png",
    "1IBL.png", "4DV4.png", "4V7K.png", "5J91.png", "6CFK.png", "6QDW.png", "6ZU5.png", "7OIA.png", "7UVV.png", "8FKR.png",
    "1IBM.png", "4DV6.png", "4V7L.png", "5JC9.png", "6CFL.png", "6QIK.png", "6ZU9.png", "7OIB.png", "7UVW.png", "8FKS.png",
    "1J5E.png", "4DV7.png", "4V7M.png", "5JCS.png", "6CZR.png", "6QNQ.png", "6ZUO.png", "7OIC.png", "7UVX.png", "8FKT.png",
    "1JGO.png", "4GKJ.png", "4V7P.png", "5JPQ.png", "6D90.png", "6QNR.png", "6ZV6.png", "7OID.png", "7UVY.png", "8FKU.png",
    "1JGP.png", "4GKK.png", "4V7R.png", "5JTE.png", "6D9J.png", "6QT0.png", "6ZVH.png", "7OIE.png", "7UW1.png", "8FKV.png",
    "1JGQ.png", "4IO9.png", "4V7S.png", "5JU8.png", "6DDD.png", "6QZP.png", "6ZVI.png", "7OIF.png", "7V08.png", "8FKW.png",
    "1JJ2.png", "4IOA.png", "4V7T.png", "5JUO.png", "6DDG.png", "6R5Q.png", "6ZVJ.png", "7OIG.png", "7V2L.png", "8FKX.png",
    "1K73.png", "4IOC.png", "4V7U.png", "5JUP.png", "6DNC.png", "6R6G.png", "6ZXD.png", "7OII.png", "7V2M.png", "8FKY.png",
    "1K9M.png", "4JI0.png", "4V7V.png", "5JUS.png", "6DTI.png", "6R7Q.png", "6ZXE.png", "7OIZ.png", "7V2N.png", "8FKZ.png",
    "1KC8.png", "4JI1.png", "4V7W.png", "5JUT.png", "6DZI.png", "6R86.png", "6ZXF.png", "7OJ0.png", "7V2O.png", "8FL0.png",
    "1KD1.png", "4JI2.png", "4V7X.png", "5JUU.png", "6DZK.png", "6R87.png", "6ZXG.png", "7OLC.png", "7V2P.png", "8FL2.png",
    "1M1K.png", "4JI3.png", "4V7Y.png", "5JVG.png", "6DZP.png", "6RBD.png", "6ZXH.png", "7OLD.png", "7V2Q.png", "8FL3.png",
    "1M90.png", "4JI4.png", "4V7Z.png", "5JVH.png", "6ELZ.png", "6RBE.png", "7A01.png", "7OOC.png", "7WTL.png", "8FL4.png",
    "1ML5.png", "4JI5.png", "4V83.png", "5KCR.png", "6EM1.png", "6RI5.png", "7A09.png", "7OOD.png", "7WTM.png", "8FL6.png",
    "1N32.png", "4JI6.png", "4V84.png", "5KCS.png", "6EM3.png", "6RM3.png", "7A1G.png", "7OPB.png", "7WTN.png", "8FL7.png",
    "1N33.png", "4JI7.png", "4V85.png", "5KPS.png", "6EM4.png", "6RW4.png", "7A5F.png", "7OPE.png", "7WTO.png", "8FL9.png",
    "1N34.png", "4JI8.png", "4V87.png", "5KPV.png", "6EM5.png", "6RXT.png", "7A5G.png", "7OSA.png", "7WTP.png", "8FLA.png",
    "1N36.png", "4JV5.png", "4V88.png", "5KPW.png", "6EML.png", "6RXU.png", "7A5H.png", "7OSM.png", "7WTQ.png", "8FLB.png",
    "1N8R.png", "4K0K.png", "4V89.png", "5KPX.png", "6ENF.png", "6RXV.png", "7A5I.png", "7OT5.png", "7WTR.png", "8FLC.png",
    "1NJI.png", "4KHP.png", "4V8A.png", "5L3P.png", "6ENJ.png", "6RXX.png", "7A5J.png", "7OTC.png", "7WTT.png", "8FLD.png",
    "1NKW.png", "4KVB.png", "4V8B.png", "5LI0.png", "6ENU.png", "6RXY.png", "7A5K.png", "7OYA.png", "7WTU.png", "8FMW.png",
    "1NWX.png", "4KZX.png", "4V8C.png", "5LKS.png", "6FAI.png", "6RXZ.png", "7AFL.png", "7OYB.png", "7WTW.png", "8FN2.png",
    "1NWY.png", "4KZY.png", "4V8D.png", "5LL6.png", "6FEC.png", "6RZZ.png", "7AFO.png", "7OYC.png", "7WTX.png", "8FOM.png",
    "1Q7Y.png", "4KZZ.png", "4V8E.png", "5LMN.png", "6FKR.png", "6S05.png", "7AIH.png", "7OYD.png", "7WTZ.png", "8FON.png",
    "1Q81.png", "4L47.png", "4V8F.png", "5LMP.png", "6FXC.png", "6S0K.png", "7AJT.png", "7P2E.png", "7WU0.png", "8FRU.png",
    "1Q82.png", "4LEL.png", "4V8H.png", "5LMQ.png", "6FYX.png", "6S0X.png", "7AJU.png", "7P3K.png", "7XAM.png", "8FTO.png",
    "1Q86.png", "4LF4.png", "4V8I.png", "5LMS.png", "6FYY.png", "6S0Z.png", "7ANE.png", "7P6Z.png", "7XNX.png", "8FVY.png",
    "1QVG.png", "4LF5.png", "4V8J.png", "5LMT.png", "6G18.png", "6S12.png", "7AOI.png", "7P7Q.png", "7XNY.png", "8G29.png",
    "1S72.png", "4LF6.png", "4V8M.png", "5LMU.png", "6G4S.png", "6S13.png", "7AOR.png", "7P7R.png", "7Y41.png", "8G2A.png",
    "1SM1.png", "4LF7.png", "4V8N.png", "5LMV.png", "6G4W.png", "6SGA.png", "7AQC.png", "7P7S.png", "7Y7C.png", "8G2B.png",
    "1VQ4.png", "4LF8.png", "4V8O.png", "5LYB.png", "6G51.png", "6SGB.png", "7AQD.png", "7P7T.png", "7Y7D.png", "8G2C.png",
    "1VQ5.png", "4LF9.png", "4V8P.png", "5LZA.png", "6G53.png", "6SGC.png", "7ASN.png", "7P7U.png", "7Y7E.png", "8G2D.png",
    "1VQ6.png", "4LFA.png", "4V8Q.png", "5LZB.png", "6G5H.png", "6SJ6.png", "7ASO.png", "7PAT.png", "7Y7F.png", "8G2U.png",
    "1VQ7.png", "4LFB.png", "4V8T.png", "5LZC.png", "6G5I.png", "6SKF.png", "7ASP.png", "7PAU.png", "7Y7G.png", "8G34.png",
    "1VQ8.png", "4LFC.png", "4V8U.png", "5LZD.png", "6GAW.png", "6SKG.png", "7AZO.png", "7PD3.png", "7Y7H.png", "8G38.png",
    "1VQ9.png", "4LFZ.png", "4V8Y.png", "5LZE.png", "6GAZ.png", "6SPC.png", "7AZY.png", "7PJS.png", "7YLA.png", "8G4S.png",
    "1VQK.png", "4LNT.png", "4V8Z.png", "5LZF.png", "6GB2.png", "6SPD.png", "7B5K.png", "7PJT.png", "7Z20.png", "8G5Y.png",
    "1VQL.png", "4LSK.png", "4V90.png", "5LZS.png", "6GBZ.png", "6SPE.png", "7BHP.png", "7PJU.png", "7Z34.png", "8G5Z.png",
    "1VQM.png", "4LT8.png", "4V91.png", "5LZU.png", "6GC0.png", "6SPF.png", "7BL2.png", "7PJV.png", "7ZJW.png", "8G61.png",
    "1VQO.png", "4NXM.png", "4V92.png", "5LZV.png", "6GC4.png", "6SPG.png", "7BL3.png", "7PJW.png", "7ZJX.png", "8G6J.png",
    "1VQP.png", "4NXN.png", "4V95.png", "5LZW.png", "6GC6.png", "6SW9.png", "7BL4.png", "7PJX.png", "7ZOD.png", "8G6W.png",
    "1VVJ.png", "4OX9.png", "4V97.png", "5LZZ.png", "6GC7.png", "6SWA.png", "7BL5.png", "7PJY.png", "7ZP8.png", "8G6X.png",
    "1VY4.png", "4P6F.png", "4V9A.png", "5M1J.png", "6GC8.png", "6SWD.png", "7BL6.png", "7PJZ.png", "7ZPQ.png", "8G6Y.png",
    "1VY5.png", "4P70.png", "4V9B.png", "5MC6.png", "6GQB.png", "6SWE.png", "7BOE.png", "7PNT.png", "7ZQ5.png", "8G7P.png",
    "1VY6.png", "4TUA.png", "4V9C.png", "5MDV.png", "6GQV.png", "6SZS.png", "7BOH.png", "7PNU.png", "7ZQ6.png", "8G7Q.png",
    "1VY7.png", "4TUB.png", "4V9D.png", "5MDW.png", "6GSJ.png", "6T59.png", "7BOI.png", "7PNV.png", "7ZRS.png", "8G7R.png",
    "1W2B.png", "4TUC.png", "4V9F.png", "5MDZ.png", "6GSK.png", "6TH6.png", "7BT6.png", "7PNW.png", "7ZS5.png", "8G7S.png",
    "1XBP.png", "4TUD.png", "4V9H.png", "5ME0.png", "6GSL.png", "6TMF.png", "7BTB.png", "7PNX.png", "7ZTA.png", "8GHU.png",
    "1XMO.png", "4TUE.png", "4V9I.png", "5ME1.png", "6GSM.png", "6U48.png", "7BV8.png", "7PNY.png", "7ZUW.png", "8GLP.png",
    "1XMQ.png", "4U1U.png", "4V9J.png", "5ME9.png", "6GSN.png", "6UCQ.png", "7CPU.png", "7PNZ.png", "7ZUX.png", "8HFR.png",
    "1XNQ.png", "4U1V.png", "4V9K.png", "5MEI.png", "6GWT.png", "6UO1.png", "7CPV.png", "7PO0.png", "7ZW0.png", "8HKU.png",
    "1XNR.png", "4U20.png", "4V9L.png", "5MGP.png", "6GXM.png", "6UZ7.png", "7D4I.png", "7PO1.png", "7k00.png", "8HKV.png",
    "1YHQ.png", "4U24.png", "4V9M.png", "5MLC.png", "6GXN.png", "6V39.png", "7D5S.png", "7PO2.png", "8A3L.png", "8HKX.png",
    "1YI2.png", "4U26.png", "4V9N.png", "5MMI.png", "6GXO.png", "6V3A.png", "7D5T.png", "7PO3.png", "8A3W.png", "8HKY.png",
    "1YIJ.png", "4U27.png", "4V9O.png", "5MMJ.png", "6GXP.png", "6V3B.png", "7D63.png", "7PPF.png", "8A57.png", "8HKZ.png",
    "1YJ9.png", "4U3M.png", "4V9P.png", "5MMM.png", "6GZ3.png", "6V3D.png", "7D6Z.png", "7PUA.png", "8A5I.png", "8HL1.png",
    "1YJN.png", "4U3N.png", "4V9Q.png", "5MRC.png", "6GZ4.png", "6V3E.png", "7D80.png", "7PUB.png", "8A63.png", "8HL2.png",
    "1YJW.png", "4U3U.png", "4V9S.png", "5MRE.png", "6GZ5.png", "6VLZ.png", "7DUG.png", "7PWF.png", "8A98.png", "8HL3.png",
    "2E5L.png", "4U4N.png", "4W29.png", "5MRF.png", "6GZQ.png", "6VMI.png", "7DUH.png", "7PWG.png", "8AKN.png", "8HL4.png",
    "2F4V.png", "4U4O.png", "4W2E.png", "5MY1.png", "6GZX.png", "6VU3.png", "7DUI.png", "7PWO.png", "8AM9.png", "8HL5.png",
    "2FTC.png", "4U4Q.png", "4W2F.png", "5MYJ.png", "6GZZ.png", "6VWL.png", "7DUJ.png", "7PZY.png", "8ANA.png", "8I7J.png",
    "2HHH.png", "4U4R.png", "4W2G.png", "5NCO.png", "6H4N.png", "6VWN.png", "7DUK.png", "7Q08.png", "8ANY.png", "8I9R.png",
    "2OTJ.png", "4U4Y.png", "4W2H.png", "5ND8.png", "6H58.png", "6VYQ.png", "7DUL.png", "7Q0F.png", "8APN.png", "8I9T.png",
    "2OTL.png", "4U4Z.png", "4W2I.png", "5ND9.png", "6HA1.png", "6VYR.png", "7F0D.png", "7Q0P.png", "8APO.png", "8I9V.png",
    "2QA4.png", "4U50.png", "4W4G.png", "5NDJ.png", "6HA8.png", "6VYS.png", "7F5S.png", "7Q0R.png", "8AUV.png", "8I9W.png",
    "2QEX.png", "4U51.png", "4WCE.png", "5NDK.png", "6HCF.png", "6VYT.png", "7JIL.png", "7Q4K.png", "8AYE.png", "8I9X.png",
    "2RDO.png", "4U52.png", "4WF1.png", "5NDV.png", "6HCJ.png", "6VYU.png", "7JQB.png", "7QCA.png", "8AZW.png", "8I9Y.png",
    "2UU9.png", "4U53.png", "4WF9.png", "5NDW.png", "6HHQ.png", "6VYW.png", "7JQC.png", "7QEP.png", "8B0X.png", "8I9Z.png",
    "2UUA.png", "4U56.png", "4WFA.png", "5NGM.png", "6HIV.png", "6VYX.png", "7JQL.png", "7QG8.png", "8B2L.png", "8IA0.png",
    "2UUB.png", "4U67.png", "4WFB.png", "5NO2.png", "6HIW.png", "6VYY.png", "7JQM.png", "7QGG.png", "8B7Y.png", "8IDY.png",
    "2UUC.png", "4U6F.png", "4WFN.png", "5NO3.png", "6HIX.png", "6VYZ.png", "7JSS.png", "7QGN.png", "8BHF.png", "8IE3.png",
    "2UXC.png", "4UG0.png", "4WOI.png", "5NP6.png", "6HIY.png", "6VZ2.png", "7JSW.png", "7QGR.png", "8BJQ.png", "8IFB.png",
    "2UXD.png", "4UJC.png", "4WPO.png", "5NRG.png", "6HMA.png", "6VZ3.png", "7JSZ.png", "7QGU.png", "8BN3.png", "8IFC.png",
    "2VQE.png", "4UJE.png", "4WQ1.png", "5NWY.png", "6HRM.png", "6VZ5.png", "7JT2.png", "7QH4.png", "8BPO.png", "8IFE.png",
    "2VQF.png", "4UY8.png", "4WQF.png", "5O2R.png", "6HTQ.png", "6VZ7.png", "7JT3.png", "7QH6.png", "8BQD.png", "8INE.png",
    "2ZJQ.png", "4V19.png", "4WQR.png", "5O5J.png", "6I0Y.png", "6VZJ.png", "7K51.png", "7QH7.png", "8BQX.png", "8INF.png",
    "2ZJR.png", "4V1A.png", "4WQU.png", "5O60.png", "6I7V.png", "6W2S.png", "7K52.png", "7QI4.png", "8BR8.png", "8INK.png",
    "2ZM6.png", "4V3P.png", "4WQY.png", "5O61.png", "6I9R.png", "6W2T.png", "7K53.png", "7QI5.png", "8BRM.png", "8IPD.png",
    "3BBX.png", "4V42.png", "4WR6.png", "5OBM.png", "6IP5.png", "6W6K.png", "7K54.png", "7QI6.png", "8BSI.png", "8IPX.png",
    "3CC2.png", "4V47.png", "4WRA.png", "5ON6.png", "6IP6.png", "6W6L.png", "7K55.png", "7QIW.png", "8BSJ.png", "8IPY.png",
    "3CC4.png", "4V48.png", "4WRO.png", "5OOL.png", "6IP8.png", "6W6P.png", "7K5I.png", "7QIX.png", "8BTD.png", "8IR1.png",
    "3CC7.png", "4V49.png", "4WSD.png", "5OOM.png", "6KE6.png", "6W7M.png", "7KGB.png", "7QIY.png", "8BTR.png", "8IR3.png",
    "3CCE.png", "4V4A.png", "4WSM.png", "5OPT.png", "6LQP.png", "6W7N.png", "7KWG.png", "7QIZ.png", "8BUU.png", "8JDJ.png",
    "3CCJ.png", "4V4B.png", "4WT1.png", "5OQL.png", "6LQQ.png", "6WD0.png", "7L08.png", "7QP6.png", "8BYV.png", "8JDK.png",
    "3CCL.png", "4V4G.png", "4WT8.png", "5OT7.png", "6LQR.png", "6WD2.png", "7L20.png", "7QP7.png", "8C00.png", "8JDL.png",
    "3CCM.png", "4V4H.png", "4WU1.png", "5T2A.png", "6LQS.png", "6WD3.png", "7LH5.png", "7QQ3.png", "8C01.png", "8JDM.png",
    "3CCQ.png", "4V4I.png", "4WWW.png", "5T2C.png", "6LQT.png", "6WD4.png", "7LS1.png", "7QV1.png", "8C3A.png", "8OHD.png",
    "3CCR.png", "4V4J.png", "4WZD.png", "5T5H.png", "6LQU.png", "6WD6.png", "7LS2.png", "7QV2.png", "8C83.png", "8OIN.png",
    "3CCS.png", "4V4N.png", "4WZO.png", "5T6R.png", "6LSR.png", "6WD7.png", "7LVK.png", "7QV3.png", "8C8X.png", "8OIP.png",
    "3CCU.png", "4V4P.png", "4X62.png", "5T7V.png", "6LSS.png", "6WD8.png", "7M4U.png", "7QWQ.png", "8C8Y.png", "8OIQ.png",
    "3CCV.png", "4V4Q.png", "4X64.png", "5TBW.png", "6LU8.png", "6WD9.png", "7M4V.png", "7QWR.png", "8C8Z.png", "8OIR.png",
    "3CD6.png", "4V4R.png", "4X65.png", "5TCU.png", "6M62.png", "6WDA.png", "7M4X.png", "7QWS.png", "8C90.png", "8OIS.png",
    "3CF5.png", "4V4S.png", "4X66.png", "5TGA.png", "6MKN.png", "6WDB.png", "7M4Y.png", "7R4X.png", "8C93.png", "8OIT.png",
    "3CMA.png", "4V4T.png", "4XEJ.png", "5TGM.png", "6MPF.png", "6WDC.png", "7M4Z.png", "7R6K.png", "8C94.png", "8OJ0.png",
    "3CME.png", "4V4V.png", "4Y4O.png", "5U4I.png", "6MPI.png", "6WDD.png", "7M5D.png", "7R6Q.png", "8C95.png", "8OJ5.png",
    "3CPW.png", "4V4W.png", "4Y4P.png", "5U9F.png", "6MSC.png", "6WDE.png", "7MD7.png", "7R7A.png", "8C96.png", "8OJ8.png",
    "3CXC.png", "4V4X.png", "4YBB.png", "5U9G.png", "6MTB.png", "6WDF.png", "7MDZ.png", "7RQ8.png", "8CAH.png", "8OM2.png",
    "3DLL.png", "4V4Y.png", "4YPB.png", "5UMD.png", "6MTC.png", "6WDG.png", "7MPI.png", "7RQ9.png", "8CAI.png", "8OM3.png",
    "3G4S.png", "4V4Z.png", "4YY3.png", "5UQ7.png", "6MTD.png", "6WDH.png", "7MPJ.png", "7RQA.png", "8CAM.png", "8OM4.png",
    "3G6E.png", "4V50.png", "4YZV.png", "5UQ8.png", "6MTE.png", "6WDI.png", "7MQ8.png", "7RQB.png", "8CAS.png", "8OVA.png",
    "3G71.png", "4V51.png", "4Z3S.png", "5UYK.png", "6N1D.png", "6WDJ.png", "7MQ9.png", "7RQC.png", "8CBJ.png", "8OVE.png",
    "3I55.png", "4V52.png", "4Z8C.png", "5UYL.png", "6N8K.png", "6WDK.png", "7MQA.png", "7RQD.png", "8CCS.png", "8P5D.png",
    "3I56.png", "4V53.png", "4ZER.png", "5UYM.png", "6N8M.png", "6WDL.png", "7MSC.png", "7RQE.png", "8CD1.png", "8P60.png",
    "3IY9.png", "4V54.png", "4ZSN.png", "5UYN.png", "6N8N.png", "6WDR.png", "7MSH.png", "7RR5.png", "8CDL.png", "8PEG.png",
    "3J3V.png", "4V55.png", "5A2Q.png", "5UYP.png", "6N8O.png", "6WNT.png", "7MSM.png", "7RYF.png", "8CDR.png", "8PHJ.png",
    "3J3W.png", "4V56.png", "5A9Z.png", "5UYQ.png", "6N9E.png", "6WNV.png", "7MSZ.png", "7RYG.png", "8CDU.png", "8PK0.png",
    "3J5L.png", "4V5A.png", "5AA0.png", "5UZ4.png", "6N9F.png", "6WNW.png", "7MT2.png", "7RYH.png", "8CDV.png", "8PKL.png",
    "3J6B.png", "4V5B.png", "5ADY.png", "5V7Q.png", "6ND5.png", "6WOO.png", "7MT3.png", "7S0S.png", "8CEC.png", "8PV1.png",
    "3J6X.png", "4V5C.png", "5AFI.png", "5V8I.png", "6ND6.png", "6WQN.png", "7MT7.png", "7S1G.png", "8CED.png", "8PV2.png",
    "3J6Y.png", "4V5D.png", "5AJ0.png", "5V93.png", "6NDK.png", "6WQQ.png", "7N1P.png", "7S1H.png", "8CEE.png", "8PV3.png",
    "3J77.png", "4V5E.png", "5AJ3.png", "5VPO.png", "6NQB.png", "6WRS.png", "7N2C.png", "7S1I.png", "8CEH.png", "8PV4.png",
    "3J78.png", "4V5F.png", "5AJ4.png", "5VPP.png", "6NSH.png", "6WRU.png", "7N2U.png", "7S1J.png", "8CEP.png", "8PV5.png",
    "3J79.png", "4V5H.png", "5AKA.png", "5VYC.png", "6NTA.png", "6WU9.png", "7N2V.png", "7S1K.png", "8CEU.png", "8PV6.png",
    "3J7A.png", "4V5J.png", "5APN.png", "5W4K.png", "6NU2.png", "6X7F.png", "7N31.png", "7S9U.png", "8CF5.png", "8PV7.png",
    "3J7O.png", "4V5K.png", "5APO.png", "5WDT.png", "6NU3.png", "6X7K.png", "7N8B.png", "7SA4.png", "8CG8.png", "8PV8.png",
    "3J7P.png", "4V5L.png", "5BR8.png", "5WE4.png", "6NUO.png", "6X9Q.png", "7NAC.png", "7SAE.png", "8CGD.png", "8PVK.png",
    "3J7Q.png", "4V5M.png", "5CZP.png", "5WE6.png", "6NWY.png", "6XA1.png", "7NAD.png", "7SFR.png", "8CGJ.png", "8Q5I.png",
    "3J7R.png", "4V5N.png", "5DAT.png", "5WF0.png", "6NY6.png", "6XDQ.png", "7NAF.png", "7SS9.png", "8CGK.png", "8QPP.png",
    "3J7Y.png", "4V5O.png", "5DC3.png", "5WFK.png", "6O3M.png", "6XDR.png", "7NAR.png", "7SSD.png", "8CGN.png", "8QSJ.png",
    "3J7Z.png", "4V5P.png", "5DFE.png", "5WFS.png", "6O7K.png", "6XE0.png", "7NAS.png", "7SSL.png", "8CGV.png", "8R3V.png",
    "3J80.png", "4V5Q.png", "5DGE.png", "5WIS.png", "6O8W.png", "6XHV.png", "7NAT.png", "7SSN.png", "8CIV.png", "8R55.png",
    "3J81.png", "4V5R.png", "5DGF.png", "5WIT.png", "6O8X.png", "6XHW.png", "7NAU.png", "7SSO.png", "8CKU.png", "8R57.png",
    "3J8G.png", "4V5S.png", "5DGV.png", "5WLC.png", "6O8Y.png", "6XHX.png", "7NAV.png", "7SSW.png", "8CMJ.png", "8R6F.png",
    "3J92.png", "4V5Y.png", "5DM6.png", "5WNP.png", "6O8Z.png", "6XHY.png", "7NAX.png", "7ST2.png", "8CSP.png", "8RCM.png",
    "3J9M.png", "4V61.png", "5DOX.png", "5WNR.png", "6O90.png", "6XIQ.png", "7NFX.png", "7ST6.png", "8CSQ.png", "8RCS.png",
    "3J9W.png", "4V63.png", "5DOY.png", "5WNS.png", "6O97.png", "6XIR.png", "7NHK.png", "7ST7.png", "8CSR.png", "8RCT.png",
    "3J9Z.png", "4V64.png", "5E7K.png", "5WNT.png", "6O9J.png", "6XQD.png", "7NHL.png", "7SUK.png", "8CSS.png", "8RD8.png",
    "3JA1.png", "4V65.png", "5E81.png", "5WNU.png", "6O9K.png", "6XQE.png", "7NRC.png", "7SYG.png", "8CST.png", "8RDV.png",
    "3JAG.png", "4V66.png", "5EL4.png", "5WNV.png", "6OF1.png", "6XU6.png", "7NRD.png", "7SYH.png", "8CVJ.png", "8RJB.png",
    "3JAH.png", "4V67.png", "5EL5.png", "5WYJ.png", "6OF6.png", "6XU7.png", "7NSO.png", "7SYI.png", "8CVK.png", "8RJC.png",
    "3JAI.png", "4V68.png", "5EL6.png", "5WYK.png", "6OFX.png", "6XU8.png", "7NSP.png", "7SYJ.png", "8CVL.png", "8RJD.png",
    "3JAJ.png", "4V69.png", "5EL7.png", "5X8P.png", "6OG7.png", "6XYW.png", "7NSQ.png", "7SYK.png", "8D8J.png", "8SCB.png",
    "3JAN.png", "4V6A.png", "5F8K.png", "5X8R.png", "6OGF.png", "6XZ7.png", "7NWG.png", "7SYL.png", "8D8K.png", "8T4S.png",
    "3JBN.png", "4V6C.png", "5FCI.png", "5X8T.png", "6OGG.png", "6XZA.png", "7NWH.png", "7SYM.png", "8D8L.png", "8T8B.png",
    "3JBO.png", "4V6D.png", "5FDU.png", "5XXB.png", "6OGI.png", "6XZB.png", "7NWI.png", "7SYN.png", "8E5T.png", "8T8C.png",
    "3JBP.png", "4V6E.png", "5FDV.png", "5XXU.png", "6OIG.png", "6Y0G.png", "7NWT.png", "7SYO.png", "8EIU.png", "8UD6.png",
    "3JBU.png", "4V6F.png", "5FLX.png", "5XY3.png", "6OJ2.png", "6Y2L.png", "7NWW.png", "7SYP.png", "8EKB.png", "8UD7.png",
    "3JCD.png", "4V6G.png", "5GAD.png", "5XYI.png", "6OKK.png", "6Y57.png", "7O5B.png", "7SYQ.png", "8EKC.png", "8UD8.png",
    "3JCE.png", "4V6I.png", "5GAE.png", "5XYM.png", "6OLE.png", "6Y69.png", "7O5H.png", "7SYR.png", "8EMM.png", "8UU4.png",
    "3JCJ.png", "4V6K.png", "5GAF.png", "5XYU.png", "6OLF.png", "6Y7C.png", "7O7Y.png", "7SYS.png", "8ESQ.png", "8UU7.png",
    "3JCN.png", "4V6L.png", "5GAG.png", "5Z3G.png", "6OLG.png", "6YEF.png", "7O7Z.png", "7SYT.png", "8ESR.png", "8UU8.png",
    "3JD5.png", "4V6M.png", "5GAH.png", "5ZEB.png", "6OLI.png", "6YLG.png", "7O80.png", "7SYU.png", "8ETC.png", "8UU9.png",
    "3OTO.png", "4V6N.png", "5H1S.png", "5ZEP.png", "6OLZ.png", "6YLH.png", "7O81.png", "7SYV.png", "8ETG.png", "8UUA.png",
    "3OW2.png", "4V6O.png", "5H4P.png", "5ZET.png", "6OM6.png", "6YLX.png", "7O9K.png", "7SYW.png", "8ETH.png", "8V9J.png",
    "3PIO.png", "4V6P.png", "5H5U.png", "5ZEU.png", "6OM7.png", "6YLY.png", "7O9M.png", "7SYX.png", "8ETI.png", "8V9K.png",
    "3PIP.png", "4V6Q.png", "5HAU.png", "5ZLU.png", "6OPE.png", "6YPU.png", "7ODR.png", "7TM3.png", "8ETJ.png", "8WHX.png",
    "3T1H.png", "4V6R.png", "5HCP.png", "5afi.png", "6ORD.png", "6YS3.png", "7ODS.png", "7TOO.png", "8EUB.png", "8WHY.png",
    "4A2I.png", "4V6S.png", "5HCQ.png", "6AWB.png", "6ORE.png", "6YSI.png", "7ODT.png", "7TOP.png", "8EUG.png", "8WI7.png",
    "4ADX.png", "4V6T.png", "5HCR.png", "6AWC.png", "6ORL.png", "6YSR.png", "7OE0.png", "7TOQ.png", "8EUI.png", "8WI8.png",
    "4AQY.png", "4V6U.png", "5HD1.png", "6AWD.png", "6OSI.png", "6YSS.png", "7OE1.png", "7TOR.png", "8EUP.png", "8WI9.png",
    "4B3M.png", "4V6V.png", "5HKV.png", "6AZ1.png", "6OSK.png", "6YST.png", "7OF0.png", "7TOS.png", "8EUY.png", "8WIB.png",
    "4B3R.png", "4V6W.png", "5HL7.png", "6AZ3.png", "6OSQ.png", "6YSU.png", "7OF1.png", "7TQL.png", "8EV3.png", "8WIC.png",
    "4B3S.png", "4V6X.png", "5I4L.png", "6B4V.png", "6OST.png", "6YT9.png", "7OF2.png", "7TTU.png", "8EV6.png", "8WID.png",
    "4B3T.png", "4V6Z.png", "5IB8.png", "6BOH.png", "6OT3.png", "6YXX.png", "7OF3.png", "7TTW.png", "8EV7.png", "8WIF.png",
    "4BTS.png", "4V70.png", "5IBB.png", "6BOK.png", "6OTR.png", "6YXY.png", "7OF4.png", "7TUT.png", "8EVP.png", "8Y0U.png",
    "4CE4.png", "4V71.png", "5IMQ.png", "6BUW.png", "6OUO.png", "6Z1P.png", "7OF5.png", "7U0H.png", "8EVQ.png", "8Y0W.png",
    "4CSU.png", "4V72.png", "5IMR.png", "6BY1.png", "6OXA.png", "6Z6J.png", "7OF6.png", "7U2H.png", "8EVR.png", "8Y0X.png",
    "4D5L.png", "4V73.png", "5IQR.png", "6BZ6.png", "6OXI.png", "6Z6K.png", "7OF7.png", "7U2I.png", "8EVS.png",
    "4D5Y.png", "4V74.png", "5IT7.png", "6BZ7.png", "6P4G.png", "6Z6L.png", "7OH3.png", "7U2J.png", "8EVT.png"]

  if (!RCSB_IDs.includes(`${_.rcsb_id.toUpperCase()}.png`)) {
    const utf8Encode = new TextEncoder();
    const byteval    = utf8Encode.encode(_.rcsb_id).reduce((acc, byte) => acc + byte, 0);
    var   pic        = RCSB_IDs[byteval % RCSB_IDs.length]
  }
  else {
    var pic = _.rcsb_id.toUpperCase() + ".png"
  }

  const taxid_dict = useAppSelector(state => state.ui.taxid_dict)

  return (
    <Link href={`/structures/${_.rcsb_id}`}>
      <Card className="w-80  max-h-full h-full  bg-white shadow-sm rounded-lg overflow-hidden relative transition   hover:shadow-xl  duration-100">
        <div className="relative h-[40%] transition-all duration-300 hover:h-[100%] border-b-2 ">
          <Image alt="Card Image" className="w-full h-full object-cover" height={160} width={400} src={`/ribxz_pics/${pic}`} style={{ aspectRatio: "400/160", objectFit: "revert-layer", }} />
          <div className="absolute top-4 left-4 transform  bg-muted border rounded-sm px-3 py-1 text-xs "> {_.rcsb_id} </div>

          <ExpMethodBadge expMethod={_.expMethod} resolution={_.resolution.toFixed(2)} className="absolute bottom-4 left-4" />


          {/* TODO: Replace with `deposition_year` */}
          {_.citation_year ? <div className="absolute bottom-4 right-4 bg-muted border rounded-sm px-3 py-1 text-xs ">{_.citation_year}  </div> : null}
          <div className="absolute top-4 right-4 transform flex flex-row gap-1   rounded-sm  py-1 text-xs">
            {
              _.subunit_presence?.includes("lsu") ? _.subunit_presence?.includes("ssu") ?
                <div className="border bg-muted rounded-sm px-1"> SSU+LSU</div> : <div className="border bg-muted rounded-sm px-1"> LSU</div>
                : <div className="border bg-muted rounded-sm px-1"> SSU</div>

            }
            {_.mitochondrial ? <div className="border bg-muted rounded-sm px-1 text-orange-500"> Mitochondrion</div> : null}


          </div>

          <div className="absolute top-10 right-4 transform flex flex-row gap-1   rounded-sm  py-1 text-xs">
          </div>

        </div>
        {/* <Popover>
          <PopoverTrigger asChild> */}
        <CardContent className="group-hover:hidden pt-4">
          <div className="text-gray-700 text-sm">

            <div className="flex justify-between group relative  rounded-sm">
              <span className="text-xs">Source Organism:</span>
              <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md  px-1 py-1 transition-colors">
                <span className=" text-xs font-medium" >
                  {_.src_organism_ids.map((taxid) => {

                    // @ts-ignore
                    return contract_taxname(taxid_dict[taxid])
                  })}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center  group relative">
              <span className="text-xs">Proteins:</span>
              <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors text-xs">
                <span title="List of proteins">{_.proteins.length}</span>
              </div>
            </div>
            <div className="flex justify-between items-center  group relative">
              <span className="text-xs">RNA:</span>
              <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors text-xs">
                <span title="List of RNA">{_.rnas.length}</span>
              </div>
            </div>
            <div className="flex justify-between items-center  group relative">
              <span className="text-xs">Ligands:</span>
              <div className="flex items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors text-xs">
                <span title="List of ligands">{_.nonpolymeric_ligands.filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion")).length}</span>
              </div>
            </div>
            {
              _.citation_rcsb_authors ?
                <div className="relative flex justify-between items-center mt-1">
                  <span className="text-xs">Authors:</span>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <span className="group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors z-10" title="Full list of authors" >
                        <span className="italic text-xs" >{_.citation_rcsb_authors[0]}</span> <span style={{
                          cursor: "pointer",
                          display: 'inline-block',
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#cccccc',
                          textAlign: 'center',
                          lineHeight: '15px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          color: 'white'
                        }}>+</span>
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 grid grid-cols-2 gap-2 z-50">
                      {
                        _.citation_rcsb_authors.map((author) => {
                          return <div key={author} className="flex items-center gap-2">
                            <div>
                              <div className="font-medium text-xs">{author}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Co-Author</div>
                            </div>
                          </div>
                        })}
                    </HoverCardContent>
                  </HoverCard>
                </div>
                : null

            }

            {_.citation_title ? <div className="text-xs text-gray-500 mt-2"> {_.citation_title} </div> : null}
          </div>


        </CardContent>

      </Card>
    </Link>
  )
}


export const StructureStack = ({ structures }:{structures:RibosomeStructure[]}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStructure = structures[currentIndex];

  return (
    <Card className="w-80 max-h-full h-full bg-white shadow-sm rounded-lg overflow-hidden relative transition hover:shadow-xl duration-100">
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {structures.map((structure, index) => (
            <div
              key={structure.rcsb_id}
              className={`flex-shrink-0 px-1 py-0.5 cursor-pointer text-[0.6rem] leading-tight ${
                index === currentIndex ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {structure.rcsb_id}
            </div>
          ))}
        </div>
        <StructureCard _={currentStructure}  />
      </div>
      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full text-xs">
        {currentIndex + 1} / {structures.length}
      </div>
    </Card>
  );
};

// const StructureCardOrStack = ({ structures, taxid_dict }) => {
//   if (structures.length === 1) {
//     return <StructureCard structure={structures[0]} taxid_dict={taxid_dict} />;
//   }
//   return <StructureStack structures={structures} taxid_dict={taxid_dict} />;
// };


