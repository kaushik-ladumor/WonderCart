import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  BadgePercent,
  CalendarRange,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PackageCheck,
  ShieldCheck,
  Ticket,
  TimerReset,
  Zap,
} from 'lucide-react';
import { API_URL } from '../../utils/constants';

const dealTypeOptions = [
  { value: 'lightning', label: 'Lightning', Icon: Zap },
  { value: 'day_deal', label: 'Day Deal', Icon: CalendarRange },
  { value: 'coupon', label: 'Coupon', Icon: Ticket }
];

const supportCards = [
  {
    title: 'Verified Offers',
    copy: 'Deals with strong discounts get priority visibility during review.',
    Icon: ShieldCheck,
    iconWrap: 'bg-[#e8efff] text-[#2156d8]'
  },
  {
    title: 'Inventory Lock',
    copy: 'Approved campaign stock is reserved for the duration of the promotion.',
    Icon: PackageCheck,
    iconWrap: 'bg-[#e7f6ee] text-[#167c3b]'
  },
  {
    title: 'Past Performance',
    copy: 'Balanced discounts usually convert better than aggressive pricing.',
    Icon: TimerReset,
    iconWrap: 'bg-[#f2f4fb] text-[#5f6c89]'
  }
];

const emptyForm = {
  productId: '',
  dealType: 'day_deal',
  discountPercent: 10,
  originalPrice: 0,
  costPrice: '',
  startTime: '',
  endTime: '',
  stockLimit: 100,
  category: ''
};

const emptySchedule = {
  startDate: '',
  startClock: '',
  endDate: '',
  endClock: ''
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (value) => String(value).padStart(2, '0');

const defaultTimeParts = {
  hour: '10',
  minute: '00',
  meridiem: 'AM'
};

const formatDisplayDateFromDate = (date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const toDisplayDate = (isoValue) => {
  if (!isoValue || !isoValue.includes('T')) return '';
  const [year, month, day] = isoValue.split('T')[0].split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
};

const toDisplayTime = (isoValue) => {
  if (!isoValue || !isoValue.includes('T')) return '';
  const rawTime = isoValue.split('T')[1] || '';
  const [hourText, minuteText] = rawTime.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return '';

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${pad(displayHour)}:${pad(minute)} ${suffix}`;
};

const parseDisplayDate = (dateText) => {
  const match = dateText.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const candidate = new Date(year, month - 1, day);

  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return candidate;
};

const parseTimeParts = (timeText) => {
  const match = timeText.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const [, hourText, minuteText, suffix] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

  return {
    hour: pad(hour),
    minute: pad(minute),
    meridiem: suffix.toUpperCase()
  };
};

const formatDisplayTimeFromParts = ({ hour, minute, meridiem }) =>
  `${pad(hour)}:${pad(minute)} ${meridiem}`;

const buildCalendarDays = (viewMonth) => {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekDay = firstDay.getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const days = [];

  for (let index = firstWeekDay - 1; index >= 0; index -= 1) {
    days.push({
      date: new Date(year, month - 1, daysInPreviousMonth - index),
      inCurrentMonth: false
    });
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    days.push({
      date: new Date(year, month, day),
      inCurrentMonth: true
    });
  }

  while (days.length < 42) {
    const nextDay = days.length - (firstWeekDay + daysInCurrentMonth) + 1;
    days.push({
      date: new Date(year, month + 1, nextDay),
      inCurrentMonth: false
    });
  }

  return days;
};

const toIsoLocal = (dateText, timeText) => {
  const dateMatch = dateText.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const timeMatch = timeText.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!dateMatch || !timeMatch) return null;

  const [, day, month, year] = dateMatch;
  let [, hourText, minuteText, suffix] = timeMatch;
  let hour = Number(hourText);

  if (hour < 1 || hour > 12) return null;

  suffix = suffix.toUpperCase();
  if (suffix === 'PM' && hour !== 12) hour += 12;
  if (suffix === 'AM' && hour === 12) hour = 0;

  return `${year}-${month}-${day}T${pad(hour)}:${minuteText}`;
};

const DateTimePickerField = ({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef(null);

  const selectedDate = useMemo(() => parseDisplayDate(dateValue), [dateValue]);
  const parsedTime = useMemo(() => parseTimeParts(timeValue) || defaultTimeParts, [timeValue]);
  const [viewMonth, setViewMonth] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  const applyTimeParts = (patch) => {
    onTimeChange(formatDisplayTimeFromParts({ ...parsedTime, ...patch }));
  };

  const handleToday = () => {
    const today = new Date();
    onDateChange(formatDisplayDateFromDate(today));
    setViewMonth(today);
  };

  return (
    <div className="relative" ref={fieldRef}>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7892]">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[56px] w-full items-center justify-between rounded-[18px] border border-[#dfe5f4] bg-[#f6f8ff] px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-[14px] text-[#1a2238]">
            {dateValue || 'dd/mm/yyyy'}
          </p>
          <p className="mt-1 text-[12px] text-[#8d97ad]">
            {timeValue || '10:00 AM'}
          </p>
        </div>
        <CalendarDays className="h-4 w-4 shrink-0 text-[#7280a0]" />
      </button>

      {isOpen ? (
        <div
          className={`absolute ${alignmentClass} top-[calc(100%+14px)] z-30 w-[360px] max-w-[92vw] rounded-[24px] border border-[#e6ebf6] bg-white p-5 shadow-[0_22px_48px_rgba(18,36,84,0.16)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-[#141b2d]">
              {monthNames[viewMonth.getMonth()]}, {viewMonth.getFullYear()}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f6ff] text-[#5e6a85]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f6ff] text-[#5e6a85]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2.5">
            {weekDays.map((day) => (
              <span
                key={day}
                className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a94aa]"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2.5">
            {calendarDays.map(({ date, inCurrentMonth }) => {
              const isSelected =
                selectedDate &&
                date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getDate() === selectedDate.getDate();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => onDateChange(formatDisplayDateFromDate(date))}
                  className={`flex h-10 w-10 items-center justify-center rounded-[12px] text-[13px] ${
                    isSelected
                      ? 'bg-[#2156d8] text-white'
                      : inCurrentMonth
                        ? 'text-[#1a2238]'
                        : 'text-[#b0b8cb]'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[18px] bg-[#f7f9ff] p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-[#5f6c89]">
              <Clock3 className="h-4 w-4" />
              Select time
            </div>

            <div className="grid grid-cols-[1fr_1fr_86px] gap-2">
              <select
                value={parsedTime.hour}
                onChange={(event) => applyTimeParts({ hour: event.target.value })}
                className="rounded-[14px] border border-[#dde4f5] bg-white px-3 py-2 text-[13px] text-[#1a2238] outline-none"
              >
                {Array.from({ length: 12 }, (_, index) => pad(index + 1)).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>

              <select
                value={parsedTime.minute}
                onChange={(event) => applyTimeParts({ minute: event.target.value })}
                className="rounded-[14px] border border-[#dde4f5] bg-white px-3 py-2 text-[13px] text-[#1a2238] outline-none"
              >
                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                {['AM', 'PM'].map((marker) => (
                  <button
                    key={marker}
                    type="button"
                    onClick={() => applyTimeParts({ meridiem: marker })}
                    className={`rounded-[14px] px-2 py-2 text-[12px] font-medium ${
                      parsedTime.meridiem === marker
                        ? 'bg-[#2156d8] text-white'
                        : 'border border-[#dde4f5] bg-white text-[#5f6c89]'
                    }`}
                  >
                    {marker}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                onDateChange('');
                onTimeChange('');
              }}
              className="text-[12px] font-medium text-[#7a86a0]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-[12px] font-medium text-[#2156d8]"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SellerCreateDeal = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [scheduleInputs, setScheduleInputs] = useState(emptySchedule);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/product/seller/product`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(response.data.products || []);
      } catch (err) {
        console.error('Fetch products error:', err.response?.data || err.message);
        setError('Failed to load products. Check your connection or login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const selectedProduct = products.find((product) => product._id === formData.productId);
    if (selectedProduct) {
      const basePrice = selectedProduct.variants?.[0]?.sizes?.[0]?.sellingPrice || 0;
      setFormData((prev) => ({
        ...prev,
        originalPrice: basePrice,
        category: selectedProduct.category
      }));
    }
  }, [formData.productId, products]);

  useEffect(() => {
    setScheduleInputs({
      startDate: toDisplayDate(formData.startTime),
      startClock: toDisplayTime(formData.startTime),
      endDate: toDisplayDate(formData.endTime),
      endClock: toDisplayTime(formData.endTime)
    });
  }, [formData.startTime, formData.endTime]);

  const dealPrice = Math.round(formData.originalPrice * (1 - formData.discountPercent / 100));
  const platformCommission = dealPrice * 0.1;
  const sellerReceives = dealPrice - platformCommission;
  const sellerProfit = sellerReceives - (formData.costPrice || 0);
  const isNegativeMargin = sellerReceives <= (formData.costPrice || 0);
  const showWarning = !isNegativeMargin && dealPrice > 0 && (sellerProfit / dealPrice) < 0.05;

  const formatINR = (num) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess(false);
    setError(null);

    const startIso = toIsoLocal(scheduleInputs.startDate, scheduleInputs.startClock);
    const endIso = toIsoLocal(scheduleInputs.endDate, scheduleInputs.endClock);

    if (!startIso || !endIso) {
      setError('Enter valid deal dates in DD/MM/YYYY format and time in HH:MM AM/PM format.');
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(
        `${API_URL}/api/deals`,
        {
          ...formData,
          startTime: startIso,
          endTime: endIso,
          dealPrice
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setSuccess(true);
      setFormData(emptyForm);
      setScheduleInputs(emptySchedule);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit deal');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((product) => product._id === formData.productId);

  return (
    <div className="mx-auto max-w-[1120px] space-y-6 pb-8">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Propose a New Deal</h1>
        <p className="mt-1 text-sm text-[#66728d]">Configure your product offer for admin approval.</p>
      </div>

      {success ? (
        <div className="rounded-[18px] border border-[#cfe9d9] bg-[#f4fbf6] px-4 py-3 text-[#18703a]">
          <p className="text-sm font-semibold">Deal submitted for review.</p>
          <p className="mt-1 text-xs text-[#4f6b58]">Admin will review your proposal shortly.</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[18px] border border-[#f2c9c9] bg-[#fff4f4] px-4 py-3 text-[#b42318]">
          <p className="text-sm font-semibold">Action Required</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#e6ebf6] bg-white p-6 md:p-7">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7892]">
                    Select Product
                  </label>
                  {loading ? (
                    <div className="h-[48px] w-full animate-pulse rounded-[18px] border border-[#e4e9f6] bg-[#f6f8ff]" />
                  ) : (
                    <select
                      required
                      className="min-h-[56px] w-full rounded-[18px] border border-[#dfe5f4] bg-[#f6f8ff] px-4 py-3 text-[14px] text-[#1a2238] outline-none"
                      value={formData.productId}
                      onChange={(event) => setFormData({ ...formData, productId: event.target.value })}
                    >
                      <option value="">-- {products.length === 0 ? 'No products found' : 'Choose one of your products'} --</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({formatINR(product.variants?.[0]?.sizes?.[0]?.sellingPrice || 0)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <DateTimePickerField
                    label="Deal Start"
                    dateValue={scheduleInputs.startDate}
                    timeValue={scheduleInputs.startClock}
                    onDateChange={(value) =>
                      setScheduleInputs((prev) => ({ ...prev, startDate: value }))
                    }
                    onTimeChange={(value) =>
                      setScheduleInputs((prev) => ({ ...prev, startClock: value }))
                    }
                  />
                </div>

                <div>
                  <DateTimePickerField
                    label="Deal Ends"
                    dateValue={scheduleInputs.endDate}
                    timeValue={scheduleInputs.endClock}
                    onDateChange={(value) =>
                      setScheduleInputs((prev) => ({ ...prev, endDate: value }))
                    }
                    onTimeChange={(value) =>
                      setScheduleInputs((prev) => ({ ...prev, endClock: value }))
                    }
                    align="right"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7892]">
                  Deal Type
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {dealTypeOptions.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, dealType: value })}
                      className={`flex min-h-[76px] items-center justify-center gap-2 rounded-[18px] border px-4 py-5 text-[14px] font-medium ${
                        formData.dealType === value
                          ? 'border-[#2156d8] bg-[#2156d8] text-white'
                          : 'border-[#dfe5f4] bg-[#f6f8ff] text-[#4f5c78]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-[#e6ebf6] bg-[#fbfcff] p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7892]">
                      Discount %
                    </p>
                    <p className="mt-1 text-[14px] text-[#66728d]">
                      Keep the discount realistic for review approval.
                    </p>
                  </div>
                  <p className="text-[18px] font-semibold text-[#2156d8]">{formData.discountPercent}%</p>
                </div>

                <div className="mt-5">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfe7fb] accent-[#2156d8]"
                    value={formData.discountPercent}
                    onChange={(event) =>
                      setFormData({ ...formData, discountPercent: parseInt(event.target.value, 10) })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7892]">
                    Actual Cost (Per Item)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="min-h-[56px] w-full rounded-[16px] border border-[#dfe5f4] bg-[#f6f8ff] px-4 py-3 text-[14px] text-[#1a2238] outline-none placeholder:text-[#8d97ad]"
                    value={formData.costPrice}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        costPrice: parseFloat(event.target.value) || ''
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d7892]">
                    Stock Limit
                  </label>
                  <input
                    type="number"
                    required
                    className="min-h-[56px] w-full rounded-[16px] border border-[#dfe5f4] bg-[#f6f8ff] px-4 py-3 text-[14px] text-[#1a2238] outline-none"
                    value={formData.stockLimit}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        stockLimit: parseInt(event.target.value, 10) || ''
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {selectedProduct ? (
              <div className="rounded-[20px] border border-[#e6ebf6] bg-white px-5 py-4 text-[13px] text-[#66728d]">
                Selected product: <span className="font-semibold text-[#141b2d]">{selectedProduct.name}</span>
                {formData.category ? (
                  <>
                    {' '}
                    in <span className="font-semibold text-[#141b2d]">{formData.category}</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="h-fit rounded-[24px] border border-[#e6ebf6] bg-white p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] text-[#2156d8]">
                <BadgePercent className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-[#141b2d]">Financial Preview</h2>
                <p className="text-[12px] text-[#66728d]">Auto-calculated before submission.</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#66728d]">Selling Price</span>
                <span className="font-semibold text-[#141b2d]">{formatINR(dealPrice)}</span>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#66728d]">Admin Fees</span>
                <span className="font-semibold text-[#c81e1e]">-{formatINR(platformCommission)}</span>
              </div>

              <div className="border-t border-[#edf1f7] pt-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-[#141b2d]">Your Earnings</span>
                  <span className="text-[22px] font-semibold leading-none text-[#141b2d]">
                    {formatINR(sellerReceives)}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-[18px] px-4 py-4 ${
                  isNegativeMargin ? 'bg-[#fff3f2] text-[#b42318]' : 'bg-[#fff3f1] text-[#d04a34]'
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                  Estimated Profit Margin
                </p>
                <p className="mt-2 text-[20px] font-semibold leading-none">
                  {formatINR(sellerProfit)} ({dealPrice > 0 ? ((sellerProfit / dealPrice) * 100).toFixed(1) : 0}%)
                </p>
              </div>

              {isNegativeMargin && formData.costPrice > 0 ? (
                <div className="rounded-[16px] border border-[#f1cccc] bg-[#fff5f5] px-4 py-3 text-[12px] text-[#b42318]">
                  This deal would go below your cost price. Reduce the discount before submitting.
                </div>
              ) : null}

              {showWarning ? (
                <div className="rounded-[16px] border border-[#f5dfb5] bg-[#fff9ef] px-4 py-3 text-[12px] text-[#996b00]">
                  Margin is very low. Review the price carefully before approval.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || isNegativeMargin || !formData.productId}
                className={`mt-1 w-full rounded-[16px] px-4 py-3 text-[14px] font-medium ${
                  submitting || isNegativeMargin || !formData.productId
                    ? 'cursor-not-allowed bg-[#e7ebf4] text-[#9aa4b8]'
                    : 'bg-[#dfe7fb] text-[#6d7892]'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Proposed Deal'}
              </button>

              <p className="text-[11px] leading-5 text-[#8d97ad]">
                Deal proposals are reviewed within 24-48 hours. Enter date as DD/MM/YYYY and time as HH:MM AM/PM.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {supportCards.map(({ title, copy, Icon, iconWrap }) => (
            <div key={title} className="rounded-[22px] border border-[#e6ebf6] bg-[#f7f9ff] p-5 md:p-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconWrap}`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-[14px] font-semibold text-[#2156d8]">{title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#66728d]">{copy}</p>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default SellerCreateDeal;
