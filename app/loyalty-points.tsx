import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useAuth } from '../../src/shared/contexts/auth-context'
import { useLoyaltyHistory, useLoyaltyPoints, useRedeemLoyaltyPoints } from '../../src/shared/hooks/useLoyalty'

export default function LoyaltyPointsScreen() {
  const { user } = useAuth()
  const { data: points = 0, isLoading: loadingPoints } = useLoyaltyPoints(user)
  const { data: history = [], isLoading: loadingHistory } = useLoyaltyHistory(user)
  const redeemMutation = useRedeemLoyaltyPoints(user)
  const [redeemCount, setRedeemCount] = useState(500)

  const canRedeem = points >= 500 && redeemCount % 500 === 0 && redeemCount <= points

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fafaf7' }}>
      {/* Header & Navbar المشترك */}
      {/* ... */}
      <View style={{ margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: '#4CAF50', fontWeight: 'bold' }}>{points} نقطة</Text>
        <Text style={{ color: '#888', marginTop: 8 }}>رصيدك الحالي</Text>
        <Text style={{ color: '#888', marginTop: 4 }}>كل 500 نقطة = 20 شيكل خصم</Text>
      </View>
      <View style={{ margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>استبدال النقاط</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text>عدد النقاط:</Text>
          <Pressable onPress={() => setRedeemCount(Math.max(500, redeemCount - 500))}><Text style={{ fontSize: 20, marginHorizontal: 8 }}>-</Text></Pressable>
          <Text style={{ fontSize: 18 }}>{redeemCount}</Text>
          <Pressable onPress={() => setRedeemCount(Math.min(points, redeemCount + 500))}><Text style={{ fontSize: 20, marginHorizontal: 8 }}>+</Text></Pressable>
        </View>
        <Pressable
          style={{ backgroundColor: canRedeem ? '#4CAF50' : '#ccc', padding: 12, borderRadius: 8, alignItems: 'center' }}
          disabled={!canRedeem || redeemMutation.isLoading}
          onPress={() => redeemMutation.mutate(redeemCount)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>استخدم النقاط</Text>
        </Pressable>
        {redeemMutation.isError && <Text style={{ color: 'red' }}>{redeemMutation.error.message}</Text>}
        {redeemMutation.isSuccess && <Text style={{ color: 'green' }}>تم الاستبدال بنجاح!</Text>}
      </View>
      <View style={{ margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>سجل النقاط</Text>
        {loadingHistory ? <Text>جاري التحميل...</Text> : history.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: item.points_delta > 0 ? '#4CAF50' : '#F44336' }}>{item.points_delta > 0 ? '+' : ''}{item.points_delta} نقطة</Text>
            <Text>{item.reason}</Text>
            <Text style={{ color: '#888' }}>{item.created_at?.slice(0, 10)}</Text>
          </View>
        ))}
      </View>
      {/* طرق جمع النقاط ... */}
    </ScrollView>
  )
}
