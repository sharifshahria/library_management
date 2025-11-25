import mongoose, { Schema, Document, models } from 'mongoose';

export interface IReservation extends Document {
  userEmail: string;
  bookId: string;
  reservedAt: Date;
  returned: boolean;
  returnedAt?: Date;
}

const ReservationSchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  reservedAt: { type: Date, default: Date.now },
  returned: { type: Boolean, default: false },
  returnedAt: { type: Date },
});

const Reservation = models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);

export default Reservation;
