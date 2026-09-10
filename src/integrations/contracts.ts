export type ShipmentScan = {
  waybill: string;
  facility: string;
  area: string;
  time: string;
  operator?: string;
  cameraHint?: string;
  eventType?: string;
};

export type VideoWindow = {
  camera: string;
  from: string;
  to: string;
  sourceUrl?: string;
};

export type SorterContext = {
  area: string;
  line?: string;
  chute?: string;
  destination?: string;
  route?: string;
};

export interface WmsAdapter {
  findShipment(waybill: string): Promise<ShipmentScan[]>;
}

export interface CctvAdapter {
  getVideoWindows(input: { scan: ShipmentScan; minutesBefore: number; minutesAfter: number }): Promise<VideoWindow[]>;
}

export interface SorterAdapter {
  getContext(scan: ShipmentScan): Promise<SorterContext | null>;
}

export interface IntakeAdapter {
  parseRequest(input: unknown): Promise<{ waybill: string; requester?: string }>;
}

export type FacilityIntegration = {
  facilityId: string;
  wms: WmsAdapter;
  cctv: CctvAdapter;
  sorter?: SorterAdapter;
  intake?: IntakeAdapter;
};
