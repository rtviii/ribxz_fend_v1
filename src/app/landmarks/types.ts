interface BaseLandmark {
  title          : string;
  description    : string;
  longDescription: string;
  imageUrl       : string;
}
interface LandmarkActions {
  download?: (rcsb_id: string) => void;
  render  ?: (rcsb_id: string) => void;
}

type Landmark<T extends LandmarkActions> = BaseLandmark & T;

interface LandmarkItemProps<T extends LandmarkActions> {
  data   : Landmark<T>;
  rcsb_id: string;
}