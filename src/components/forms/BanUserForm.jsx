import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../ui/FormInput';
import Button from '../ui/Button';
import { banUser } from '../../services/api/bans';
import { useToast } from '../../hooks/useToast';

const schema = yup.object().shape({
  ipAddress: yup.string()
    .required('IP 주소를 입력해주세요.')
    .matches(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/, '유효한 IP 주소 형식이 아닙니다.'),
  attackType: yup.string()
    .required('공격 유형을 입력해주세요.')
    .max(50, '공격 유형은 50자 이내로 입력해주세요.'),
  reason: yup.string().optional(),
  expiresAt: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, '만료일시 형식이 올바르지 않습니다. (예: YYYY-MM-DD HH:MM:SS)')
    .optional(),
});

const BanUserForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });
  const { toast } = useToast(); // useToast 훅에서 toast 객체를 가져옵니다.
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await banUser(data);
      toast.success('유저 제재에 성공했습니다.'); // toast.success 사용
      reset();
    } catch (error) {
      toast.error(`유저 제재에 실패했습니다: ${error.message}`); // toast.error 사용
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          id="ipAddress"
          label="IP 주소"
          type="text"
          {...register('ipAddress')}
          error={errors.ipAddress?.message}
        />
        <FormInput
          id="attackType"
          label="공격 유형"
          type="text"
          {...register('attackType')}
          error={errors.attackType?.message}
        />
        <FormInput
          id="reason"
          label="제재 사유"
          type="text"
          {...register('reason')}
          error={errors.reason?.message}
        />
        <FormInput
          id="expiresAt"
          label="만료 일시 (YYYY-MM-DD HH:MM:SS)"
          type="text"
          {...register('expiresAt')}
          error={errors.expiresAt?.message}
          placeholder="예: 2025-12-31 23:59:59"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoading ? '제재 중...' : '유저 제재'}
        </Button>
      </form>
    </div>
  );
};

export default BanUserForm;
